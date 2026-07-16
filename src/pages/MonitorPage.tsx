import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { detectFaces, loadModels, matchDescriptor, type RecognitionTarget } from '../lib/faceapi';
import { elementSize, getCameraSource, type CameraElement, type CameraSource } from '../lib/camera';
import { severityStroke } from '../lib/colors';
import { useSocket } from '../hooks/useSocket';
import { t } from '../i18n/strings';
import { EventFeed } from '../components/monitor/EventFeed';
import { CheckoutModal } from '../components/monitor/CheckoutModal';
import { AddGuestModal } from '../components/monitor/AddGuestModal';
import { CameraFeed } from '../components/ui/CameraFeed';
import { CameraSettingsModal } from '../components/ui/CameraSettingsModal';
import type {
  GuestDescriptor,
  Gym,
  GymEvent,
  MemberDescriptors,
  RecognizeResult,
  Severity,
} from '../lib/types';

/** Last known decision per member, used to color the overlay circle. */
interface FaceState {
  severity: Severity;
  message: string;
  name: string;
  daysRemaining: number | null;
  at: number;
}

const DETECT_INTERVAL_MS = 600;
const RECOGNIZE_THROTTLE_MS = 8_000; // per member; server debounces 5 min anyway
const UNKNOWN_THROTTLE_MS = 30_000; // unknown faces have no identity to key on
const STATE_TTL_MS = 5 * 60 * 1000;

export function MonitorPage() {
  const camRef = useRef<CameraElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<CameraSource>(() => getCameraSource());
  const [cameraOpen, setCameraOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [events, setEvents] = useState<GymEvent[]>([]);
  const [occupancy, setOccupancy] = useState(0);
  const queryClient = useQueryClient();

  // mutable state read by the detection loop (avoids re-renders per frame)
  // keys: "m<id>" for members, "g<id>" for guests
  const faceStates = useRef(new Map<string, FaceState>());
  const lastSent = useRef(new Map<string, number>());
  const lastUnknownSent = useRef(0);

  // --- server state ---------------------------------------------------
  const { data: descriptors = [] } = useQuery({
    queryKey: ['descriptors'],
    queryFn: async () => (await api.get<MemberDescriptors[]>('/members/descriptors')).data,
    refetchInterval: 60_000,
  });
  const { data: guestDescriptors = [] } = useQuery({
    queryKey: ['guest-descriptors'],
    queryFn: async () => (await api.get<GuestDescriptor[]>('/guests/descriptors')).data,
    refetchInterval: 60_000,
  });
  const targetsRef = useRef<RecognitionTarget[]>([]);
  // Number() guards against string ids from stale caches (bigint columns
  // were serialized as strings before the pg type-parser fix)
  targetsRef.current = [
    ...descriptors.map((m) => ({
      kind: 'member' as const,
      id: Number(m.member_id),
      name: m.full_name,
      descriptors: m.descriptors,
    })),
    ...guestDescriptors.map((g) => ({
      kind: 'guest' as const,
      id: Number(g.guest_id),
      name: g.name,
      descriptors: [g.descriptor],
    })),
  ];

  const { data: gym } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<Gym>('/settings')).data,
  });
  const threshold = gym?.settings.match_threshold ?? 0.5;
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;

  useEffect(() => {
    void api.get<GymEvent[]>('/events').then((r) => setEvents(r.data));
    void api.get<{ count: number }>('/occupancy').then((r) => setOccupancy(r.data.count));
  }, []);

  useSocket({
    'event:new': (event: GymEvent) => setEvents((prev) => [event, ...prev].slice(0, 100)),
    'occupancy:update': (payload: { count: number }) => {
      setOccupancy(payload.count);
      void queryClient.invalidateQueries({ queryKey: ['check-ins-open'] });
    },
    'checkin:result': (result: RecognizeResult) => applyResult(result),
  });

  function applyResult(result: RecognizeResult) {
    if (!result.matched || !result.decision) return;
    const key = result.member ? `m${result.member.id}` : result.guest ? `g${result.guest.id}` : null;
    if (!key) return;
    faceStates.current.set(key, {
      // manual entry mode: allowed-but-unapproved shows as yellow "awaiting approval"
      severity: result.pending ? 'yellow' : result.decision.severity,
      message: result.pending ? t('monitor.awaitingApproval') : result.decision.message,
      name: result.member?.full_name ?? result.guest?.name ?? '',
      daysRemaining: result.pending ? null : result.decision.daysRemaining,
      at: Date.now(),
    });
  }

  const overrideMutation = useMutation({
    mutationFn: async (memberId: number) =>
      (await api.post('/check-ins/override', { member_id: Number(memberId) })).data,
    onSuccess: (_data, memberId) => {
      const prev = faceStates.current.get(`m${memberId}`);
      if (prev)
        faceStates.current.set(`m${memberId}`, { ...prev, severity: 'green', message: 'entry allowed by staff' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (memberId: number) =>
      (await api.post<RecognizeResult>('/check-ins/approve', { member_id: Number(memberId) })).data,
    onSuccess: (result) => applyResult(result),
  });

  // --- detection loop (camera element is provided by <CameraFeed>) -----
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;
    let detecting = false;

    void (async () => {
      await loadModels();
      if (cancelled) return;
      setReady(true);

      timer = setInterval(async () => {
        const cam = camRef.current;
        const canvas = canvasRef.current;
        if (!cam || !canvas || elementSize(cam).width === 0 || detecting) return;
        detecting = true;
        try {
          const faces = await detectFaces(cam);
          drawOverlay(cam, canvas, faces);
        } catch {
          /* transient decode errors on stream hiccups — skip the frame */
        } finally {
          detecting = false;
        }
      }, DETECT_INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawOverlay(
    cam: CameraElement,
    canvas: HTMLCanvasElement,
    faces: Awaited<ReturnType<typeof detectFaces>>,
  ) {
    const { width, height } = elementSize(cam);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const face of faces) {
      const match = matchDescriptor(face.descriptor, targetsRef.current, thresholdRef.current);

      let severity: Severity = 'red';
      let label = t('monitor.unknown');
      let sub = 'no match';

      if (match) {
        const key = `${match.kind === 'member' ? 'm' : 'g'}${match.id}`;
        const state = faceStates.current.get(key);
        const fresh = state && Date.now() - state.at < STATE_TTL_MS;
        if (fresh && state) {
          severity = state.severity;
          label = state.name;
          sub =
            state.daysRemaining !== null && state.severity !== 'red' && match.kind === 'member'
              ? `${state.daysRemaining} ${t('common.days')}`
              : state.message;
        } else {
          label = match.name;
          sub = '…';
          severity = 'blue';
        }
        maybeRecognize(match.kind, match.id, match.distance);
      } else {
        maybeReportUnknown(face.descriptor);
      }

      // circle
      const cx = face.box.x + face.box.width / 2;
      const cy = face.box.y + face.box.height / 2;
      const r = (Math.max(face.box.width, face.box.height) / 2) * 1.25;
      ctx.strokeStyle = severityStroke[severity];
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // name + status pills
      const pill = `${label} · ${sub}`;
      ctx.font = '600 20px Inter, sans-serif';
      const width = ctx.measureText(pill).width + 24;
      const px = cx - width / 2;
      const py = cy - r - 40;
      ctx.fillStyle = severityStroke[severity];
      ctx.beginPath();
      ctx.roundRect(px, py, width, 32, 16);
      ctx.fill();
      ctx.fillStyle = severity === 'yellow' ? '#1e293b' : '#ffffff';
      ctx.fillText(pill, px + 12, py + 22);
    }
  }

  function maybeRecognize(kind: 'member' | 'guest', id: number, distance: number) {
    const key = `${kind === 'member' ? 'm' : 'g'}${id}`;
    const last = lastSent.current.get(key) ?? 0;
    if (Date.now() - last < RECOGNIZE_THROTTLE_MS) return;
    lastSent.current.set(key, Date.now());
    void api
      .post<RecognizeResult>('/check-ins/recognize', {
        [kind === 'member' ? 'member_id' : 'guest_id']: id,
        confidence: distance,
      })
      .then((r) => applyResult(r.data))
      .catch(() => undefined);
  }

  function maybeReportUnknown(descriptor: Float32Array) {
    if (Date.now() - lastUnknownSent.current < UNKNOWN_THROTTLE_MS) return;
    lastUnknownSent.current = Date.now();
    void api
      .post('/check-ins/recognize', { descriptor: Array.from(descriptor) })
      .catch(() => undefined);
  }

  // --- render ----------------------------------------------------------
  return (
    <div className="flex h-[calc(100vh-3rem)] gap-5">
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl bg-black">
        <CameraFeed
          key={JSON.stringify(source)}
          source={source}
          elementRef={camRef}
          className="h-full w-full object-contain"
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-contain" />

        {/* gym name, top center */}
        <div className="pointer-events-none absolute left-1/2 top-4 max-w-[70%] -translate-x-1/2 rounded-xl bg-black/60 px-6 py-2 backdrop-blur">
          <div className="gym-name truncate text-center text-4xl leading-tight">
            {gym?.name ?? t('app.name')}
          </div>
        </div>

        {/* occupancy, top right */}
        <div className="absolute right-4 top-4 rounded-xl bg-black/60 px-4 py-2 text-white backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-slate-300">{t('monitor.occupancy')}</div>
          <div className="text-3xl font-bold leading-tight">{occupancy}</div>
        </div>

        {/* quick actions, bottom left */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button className="btn-secondary" onClick={() => setCheckoutOpen(true)}>
            {t('monitor.checkOut')}
          </button>
          <button className="btn-secondary" onClick={() => setGuestOpen(true)}>
            {t('monitor.addGuest')}
          </button>
          <button className="btn-secondary" onClick={() => setCameraOpen(true)}>
            {t('camera.button')}
          </button>
        </div>

        {!ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white">
            {t('monitor.loadingModels')}
          </div>
        )}
      </div>

      <aside className="w-80 shrink-0">
        <EventFeed
          events={events}
          overriding={overrideMutation.isPending || approveMutation.isPending}
          onOverride={(memberId) => overrideMutation.mutate(memberId)}
          onApprove={(memberId) => approveMutation.mutate(memberId)}
        />
      </aside>

      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
      {guestOpen && <AddGuestModal onClose={() => setGuestOpen(false)} />}
      {cameraOpen && (
        <CameraSettingsModal current={source} onSave={setSource} onClose={() => setCameraOpen(false)} />
      )}
    </div>
  );
}
