import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppleTestimonials } from './Testimonials';

const testimonials = [
  { quote: 'Great to work with.', name: 'Jane Doe', role: 'Founder' },
  { quote: 'Shipped fast.', name: 'John Smith', role: 'PM' },
];

describe('AppleTestimonials', () => {
  it('renders each testimonial quote and attribution', () => {
    render(<AppleTestimonials testimonials={testimonials} />);
    expect(screen.getByText('“Great to work with.”')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe, Founder')).toBeInTheDocument();
  });
});
