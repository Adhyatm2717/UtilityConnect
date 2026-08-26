// Mock service categories (from frontend)
const services = [
  { name: 'Electrician', slug: 'electrician', icon: 'bolt', description: 'Wiring, repairs, installations', color: 'bg-primary/10 text-primary' },
  { name: 'Plumber', slug: 'plumber', icon: 'water_drop', description: 'Pipes, leaks, bathroom fitting', color: 'bg-secondary/10 text-secondary' },
  { name: 'Carpenter', slug: 'carpenter', icon: 'carpenter', description: 'Furniture, doors, woodwork', color: 'bg-tertiary/10 text-tertiary' },
  { name: 'Tailor', slug: 'tailor', icon: 'styler', description: 'Stitching, alterations, designs', color: 'bg-primary/10 text-primary' },
  { name: 'Maintenance', slug: 'maintenance', icon: 'handyman', description: 'General repairs and upkeep', color: 'bg-secondary/10 text-secondary' },
];

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = (req, res) => {
  res.status(200).json(services);
};
