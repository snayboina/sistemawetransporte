import { Registration, SyncReading, DashboardStats, Driver, Bus, Route } from '@/types/transport';

export const mockDrivers: Driver[] = [
  { id: '1', name: 'Carlos Silva' },
  { id: '2', name: 'Ana Oliveira' },
  { id: '3', name: 'João Santos' },
  { id: '4', name: 'Maria Costa' },
  { id: '5', name: 'Pedro Lima' },
];

export const mockBuses: Bus[] = [
  { id: '1', number: 'AMB-3241', plate: 'ABC-1234' },
  { id: '2', number: 'AMB-5678', plate: 'DEF-5678' },
  { id: '3', number: 'AMB-9012', plate: 'GHI-9012' },
  { id: '4', number: 'AMB-3456', plate: 'JKL-3456' },
];

export const mockRoutes: Route[] = [
  { id: '1', name: 'Terminal Centro → Shopping', code: 'R001' },
  { id: '2', name: 'Zona Norte → Centro', code: 'R002' },
  { id: '3', name: 'Zona Sul → Terminal', code: 'R003' },
  { id: '4', name: 'Circular Centro', code: 'R004' },
];

export const mockDashboardStats: DashboardStats = {
  activeBuses: 142,
  activeDrivers: 138,
  todayReadings: 2845,
  activeRoutes: 28,
};

export const mockRegistrations: Registration[] = [
  {
    id: 'REG-001',
    driverId: '1',
    driverName: 'Carlos Silva',
    busNumber: 'AMB-3241',
    busPlate: 'ABC-1234',
    routeId: '1',
    routeName: 'Terminal Centro → Shopping',
    location: '-23.5505, -46.6333',
    createdAt: new Date('2025-01-01T08:00:00'),
    qrCodeData: 'TRP-001-CS-ABC1234',
  },
  {
    id: 'REG-002',
    driverId: '2',
    driverName: 'Ana Oliveira',
    busNumber: 'AMB-5678',
    busPlate: 'DEF-5678',
    routeId: '2',
    routeName: 'Zona Norte → Centro',
    location: '-23.5489, -46.6388',
    createdAt: new Date('2025-01-01T08:30:00'),
    qrCodeData: 'TRP-002-AO-DEF5678',
  },
];

export const mockSyncReadings: SyncReading[] = [
  {
    id: 'READ-001',
    registrationId: 'REG-001',
    driverName: 'Carlos Silva',
    busNumber: 'AMB-3241',
    busPlate: 'ABC-1234',
    routeName: 'Terminal Centro → Shopping',
    location: '-23.5505, -46.6333',
    readingLocation: 'Terminal Central',
    readAt: new Date('2025-01-01T09:15:00'),
  },
  {
    id: 'READ-002',
    registrationId: 'REG-001',
    driverName: 'Carlos Silva',
    busNumber: 'AMB-3241',
    busPlate: 'ABC-1234',
    routeName: 'Terminal Centro → Shopping',
    location: '-23.5505, -46.6333',
    readingLocation: 'Ponto Shopping',
    readAt: new Date('2025-01-01T09:45:00'),
  },
  {
    id: 'READ-003',
    registrationId: 'REG-002',
    driverName: 'Ana Oliveira',
    busNumber: 'AMB-5678',
    busPlate: 'DEF-5678',
    routeName: 'Zona Norte → Centro',
    location: '-23.5489, -46.6388',
    readingLocation: 'Estação Norte',
    readAt: new Date('2025-01-01T10:00:00'),
  },
  {
    id: 'READ-004',
    registrationId: 'REG-002',
    driverName: 'Ana Oliveira',
    busNumber: 'AMB-5678',
    busPlate: 'DEF-5678',
    routeName: 'Zona Norte → Centro',
    location: '-23.5489, -46.6388',
    readingLocation: 'Praça Central',
    readAt: new Date('2025-01-01T10:30:00'),
  },
  {
    id: 'READ-005',
    registrationId: 'REG-001',
    driverName: 'Carlos Silva',
    busNumber: 'AMB-3241',
    busPlate: 'ABC-1234',
    routeName: 'Terminal Centro → Shopping',
    location: '-23.5505, -46.6333',
    readingLocation: 'Terminal Central',
    readAt: new Date('2025-01-01T11:00:00'),
  },
];
