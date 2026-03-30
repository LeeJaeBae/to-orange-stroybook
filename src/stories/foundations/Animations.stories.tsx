import type { Meta, StoryObj } from '@storybook/react';

function AnimBox({ label, className }: { label: string; className: string }) {
  return (
    <div className="text-center">
      <div className={`w-16 h-16 bg-orange-400 rounded-lg mx-auto mb-2 ${className}`} />
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}

function AnimationsShowcase() {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold">Animations</h2>

      <section>
        <h3 className="text-lg font-semibold mb-4">CSS Animations</h3>
        <div className="flex flex-wrap gap-8">
          <AnimBox label="fade-in" className="animate-fade-in" />
          <AnimBox label="slide-in-right" className="animate-slide-in-right" />
          <AnimBox label="scale-in" className="animate-scale-in" />
          <AnimBox label="bounce-gentle" className="animate-bounce-gentle" />
          <AnimBox label="float" className="animate-float" />
          <AnimBox label="glow-pulse" className="animate-glow-pulse" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Scroll Reveal</h3>
        <div className="scroll-reveal revealed">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="reveal-child w-24 h-24 bg-orange-200 rounded-lg flex items-center justify-center">
                Child {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Fade Up</h3>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`fade-up visible fade-up-delay-${i} w-24 h-24 bg-orange-300 rounded-lg flex items-center justify-center`}>
              Delay {i}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Animations',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const All: Story = {
  render: () => <AnimationsShowcase />,
};
