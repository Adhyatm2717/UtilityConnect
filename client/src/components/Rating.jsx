// Renders star icons for a given rating (out of 5)
function Rating({ value, size = 'sm' }) {
  const starSize = size === 'sm' ? 'text-[14px]' : 'text-[18px]';

  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined ${starSize} ${star <= Math.round(value) ? 'text-tertiary-container' : 'text-outline-variant'}`}
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default Rating;
