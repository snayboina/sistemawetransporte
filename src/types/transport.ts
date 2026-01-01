export interface Driver {
  id: string;
  name: string;
}

export interface Bus {
  id: string;
  number: string;
  plate: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
}

export interface Registration {
  id: string;
  driverId: string;
  driverName: string;
  busNumber: string;
  busPlate: string;
  routeId: string;
  routeName: string;
  location: string;
  createdAt: Date;
  qrCodeData: string;
}

export interface SyncReading {
  id: string;
  registrationId: string;
  driverName: string;
  busNumber: string;
  busPlate: string;
  routeName: string;
  location: string;
  readingLocation: string;
  readAt: Date;
}

export interface DashboardStats {
  activeBuses: number;
  activeDrivers: number;
  todayReadings: number;
  activeRoutes: number;
}
