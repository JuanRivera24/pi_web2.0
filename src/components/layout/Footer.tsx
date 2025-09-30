export default function Footer() {
return (
<footer className="bg-blue-950 text-white mt-8">
<section id="mapa" className="content mapa scroll-mt-24">
<iframe
title="Sedes Kingdom Barber"
src="https://www.google.com/maps/d/embed?mid=1S-kqNA4B0xWaYsdzM4P2ChnU-4_WrJ0&ehbc=2E312F"
width="100%"
height="250"
loading="lazy"
className="w-full border-0"
/>
</section>
  <div className="text-center py-4">Kingdom Barber ®2024</div>
</footer>
);
}