const Application = require('../models/Application');

const JOBS_LIST = [
  { id: 1, name: 'Cleaners', description: 'Professional cleaning services' },
  { id: 2, name: 'Warehouse Workers', description: 'Warehouse and logistics operations' },
  { id: 3, name: 'Plumbers', description: 'Plumbing and maintenance services' },
  { id: 4, name: 'Health Care Workers', description: 'Healthcare and medical support' },
  { id: 5, name: 'Caregivers', description: 'Personal care and support services' },
  { id: 6, name: 'Waiters', description: 'Food and beverage service' },
  { id: 7, name: 'Hostess', description: 'Restaurant and hospitality services' },
  { id: 8, name: 'Truck Drivers', description: 'Transportation and logistics' },
  { id: 9, name: 'Baristas', description: 'Coffee shop and café services' },
  { id: 10, name: 'Security Officers', description: 'Security and safety services' },
  { id: 11, name: 'Chefs', description: 'Culinary and kitchen services' }
];

const generateApplicationId = async () => {
  const year = new Date().getFullYear();
  const count = await Application.countDocuments();
  const number = String(count + 1).padStart(6, '0');
  return `LUX-${year}-${number}`;
};

module.exports = { JOBS_LIST, generateApplicationId };
