'use client';

export default function StellarField() {
  return (
    <div className="stellar-field" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => <span key={index} className="stellar-star" />)}
    </div>
  );
}
