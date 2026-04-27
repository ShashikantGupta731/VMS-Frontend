export const VEHICLE_TYPES = [
  'AMBULANCE', 'BULLDOZER', 'BUSES', 'COUPE', 'CRANE', 'FIRE TRUCK', 
  'HATCHBACK', 'JEEPS', 'LOW SPEED VEHICLE', 'MOTORCYCLE', 'MUV', 
  'PICKUP TRUCK', 'SALOON', 'SCOOTER', 'SEDAN', 'SUV', 'SWEEPING TRUCKS', 
  'TRACTOR', 'TRUCKS'
];

export const FUEL_TYPES = [
  'Petrol', 'Diesel', 'Compressed Natural Gas (CNG)', 
  'Liquefied Petroleum Gas (LPG)', 'Electric'
];

// Vehicle type to manufacturers mapping (Indian manufacturers)
export const VEHICLE_TYPE_MANUFACTURERS: { [key: string]: string[] } = {
  'AMBULANCE': ['Eicher', 'Force', 'Mahindra', 'Maruti Suzuki', 'Swaraj Mazda', 'Tata'],
  'BULLDOZER': ['BEML'],
  'BUSES': ['Ashok Leyland', 'BharatBenz', 'Eicher', 'Force', 'Isuzu', 'JBN', 'Mahindra', 'SML Isuzu', 'Swaraj Mazda', 'Tata', 'Volvo'],
  'COUPE': ['Audi', 'BMW', 'Fiat', 'Mercedes-Benz', 'Nissan', 'Volkswagen'],
  'CRANE': ['Escort'],
  'FIRE TRUCK': ['Tata'],
  'HATCHBACK': ['BMW', 'Chevrolet', 'Datsun', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Mahindra', 'Maruti Suzuki', 'Mercedes-Benz', 'Nissan', 'Renault', 'Swaraj Mazda', 'Tata', 'Toyota', 'Volkswagen', 'Volvo'],
  'JEEPS': ['Mahindra', 'Maruti Suzuki'],
  'LOW SPEED VEHICLE': ['Maini'],
  'MOTORCYCLE': ['Bajaj', 'Hero', 'Honda', 'Kawasaki', 'KTM', 'Royal Enfield', 'Suzuki', 'TVS', 'Yamaha'],
  'MUV': ['Audi', 'BMW', 'Chevrolet', 'Datsun', 'Honda', 'Hyundai', 'Jaguar', 'KIA', 'Land Rover', 'Lexus', 'Mahindra', 'Maruti Suzuki', 'Mercedes-Benz', 'Nissan', 'Renault', 'Ssangyong', 'Tata', 'Toyota', 'Volkswagen', 'Volvo'],
  'PICKUP TRUCK': ['Bajaj', 'Isuzu', 'Mahindra', 'Swaraj Mazda', 'Tata', 'Toyota'],
  'SALOON': ['Hindustan Motors', 'Honda', 'Mahindra', 'Renault', 'Tata', 'Toyota'],
  'SCOOTER': ['Bajaj', 'Hero', 'Honda', 'Suzuki', 'TVS', 'Vespa', 'Yamaha'],
  'SEDAN': ['Audi', 'BMW', 'Chevrolet', 'Fiat', 'Ford', 'Hindustan Motors', 'Honda', 'Hyundai', 'Jaguar', 'Lexus', 'Mahindra', 'Maruti Suzuki', 'Mercedes-Benz', 'Nissan', 'Renault', 'Skoda', 'Tata', 'Toyota', 'Volkswagen', 'Volvo'],
  'SUV': ['Chevrolet', 'Force', 'Ford', 'Hyundai', 'Isuzu', 'Jeep', 'KIA', 'Mahindra', 'Maruti Suzuki', 'Mercedes-Benz', 'Mitsubishi', 'Renault', 'Tata', 'Toyota'],
  'SWEEPING TRUCKS': ['N Square Marketing Associates Pvt. Ltd.'],
  'TRACTOR': ['CNH Industrial (India) Pvt. Ltd.', 'Eicher', 'Escort', 'Ford', 'HMT', 'John Deere India Pvt Ltd', 'Mahindra', 'Massey Ferguson', 'Sonalika', 'Swaraj Mazda'],
  'TRUCKS': ['Ashok Leyland', 'BharatBenz', 'Eicher', 'Isuzu', 'Mahindra', 'SML Isuzu', 'Tata', 'Toyota'],
  'VAN': ['Chevrolet', 'Eicher', 'Force', 'Mahindra', 'Maruti Suzuki', 'SML Isuzu', 'Swaraj Mazda', 'Tata'],
  'WATER CANNON': ['Tata']
};

// Model options based on vehicle type and manufacturer
export const VEHICLE_TYPE_MANUFACTURER_MODELS: { [vehicleType: string]: { [manufacturer: string]: string[] } } = {};
