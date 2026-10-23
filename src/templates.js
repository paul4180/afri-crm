export const TEMPLATE_STAGES = {
  services: ['Discovery', 'Needs', 'Proposal', 'Negotiation', 'Verbal yes', 'Won', 'Lost'],
  retail: ['Enquiry', 'Quoted', 'Order', 'Payment', 'Delivery', 'Won', 'Lost'],
  field: ['Visit booked', 'Met', 'Quoted', 'Follow-up', 'Agreed', 'Won', 'Lost'],
};

export function stageNames(key) {
  return TEMPLATE_STAGES[key] || TEMPLATE_STAGES.services;
}
