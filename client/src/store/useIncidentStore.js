import { create } from 'zustand';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { playEmergencySiren, playChime, playWarningBeep } from '../utils/soundAlerts';

export const useIncidentStore = create((set, get) => ({
  incidents: [],
  selectedIncident: null,
  activeBroadcasts: [],
  isLoading: false,
  soundEnabled: true,
  controlRoomMode: false,
  filters: {
    status: 'all',
    priority: 'all',
    type: 'all',
    block: 'all',
    myAssigned: false,
    search: '',
  },
  activeBannerAlert: null,

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().fetchIncidents();
  },

  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
  toggleControlRoomMode: () => set({ controlRoomMode: !get().controlRoomMode }),
  dismissBannerAlert: () => set({ activeBannerAlert: null }),

  fetchIncidents: async () => {
    set({ isLoading: true });
    try {
      const f = get().filters;
      const res = await api.incidents.list({
        status: f.status !== 'all' ? f.status : undefined,
        priority: f.priority !== 'all' ? f.priority : undefined,
        type: f.type !== 'all' ? f.type : undefined,
        block: f.block !== 'all' ? f.block : undefined,
        myAssigned: f.myAssigned ? 'true' : undefined,
      });

      if (res.success) {
        set({ incidents: res.incidents, isLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
      set({ isLoading: false });
    }
  },

  fetchIncidentById: async (id) => {
    try {
      const res = await api.incidents.getById(id);
      if (res.success) {
        set({ selectedIncident: res });
        return res;
      }
    } catch (err) {
      console.error('Failed to get incident', err);
    }
    return null;
  },

  subscribeToSocketEvents: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off('incident:new');
    socket.off('incident:updated');
    socket.off('incident:escalated');
    socket.off('broadcast:new');

    socket.on('incident:new', (newIncident) => {
      console.log('🚨 Received new incident via WebSocket:', newIncident);
      set((state) => ({
        incidents: [newIncident, ...state.incidents.filter(i => i._id !== newIncident._id)],
        activeBannerAlert: {
          type: 'CRITICAL_INCIDENT',
          title: `🚨 ${newIncident.type.toUpperCase()} Emergency Reported!`,
          message: `${newIncident.location?.blockName} - Room ${newIncident.location?.roomNumber}`,
          incident: newIncident
        }
      }));

      if (get().soundEnabled && !newIncident.isSilent) {
        playEmergencySiren(2.5);
      }
    });

    socket.on('incident:updated', ({ incidentId, updates, updatedIncident }) => {
      console.log('🔄 Incident updated:', incidentId, updates);
      set((state) => ({
        incidents: state.incidents.map((i) =>
          i._id === incidentId ? { ...i, ...updates, ...(updatedIncident || {}) } : i
        ),
      }));

      // If viewing this incident, update selected
      const currentSelected = get().selectedIncident;
      if (currentSelected && currentSelected.incident._id === incidentId) {
        get().fetchIncidentById(incidentId);
      }

      if (get().soundEnabled) {
        playChime();
      }
    });

    socket.on('incident:escalated', ({ incidentId, reason, incident }) => {
      console.warn('⚠️ Incident escalated:', incidentId, reason);
      set((state) => ({
        incidents: state.incidents.map((i) =>
          i._id === incidentId ? { ...i, priority: 'critical', escalated: true, slaBreached: true } : i
        ),
        activeBannerAlert: {
          type: 'SLA_BREACH',
          title: `⚠️ ESCALATION: SLA Breached!`,
          message: `Incident #${incidentId} has exceeded maximum allowed response target!`,
          incident
        }
      }));

      if (get().soundEnabled) {
        playWarningBeep();
      }
    });

    socket.on('broadcast:new', (bcast) => {
      set((state) => ({
        activeBroadcasts: [bcast, ...state.activeBroadcasts],
        activeBannerAlert: {
          type: 'BROADCAST',
          title: bcast.title,
          message: bcast.message,
          broadcast: bcast
        }
      }));

      if (get().soundEnabled) {
        playWarningBeep();
      }
    });
  },
}));
