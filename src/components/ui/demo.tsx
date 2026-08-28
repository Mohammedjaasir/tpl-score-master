import SocialCards from "@/components/ui/card-fan-carousel";

const DEMO_CARDS = [
  { imgUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=700&fit=crop", alt: "Mountain landscape" },
  { imgUrl: "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=400&h=700&fit=crop", alt: "City night" },
  { imgUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=700&fit=crop", alt: "Foggy forest" },
  { imgUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=700&fit=crop", alt: "Sunlit woods" },
  { imgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=700&fit=crop", alt: "Tropical beach" },
  { imgUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=700&fit=crop", alt: "Starry mountain" },
  { imgUrl: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400&h=700&fit=crop", alt: "Golden sunset" },
  { imgUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=700&fit=crop", alt: "Lake reflection" },
  { imgUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=700&fit=crop", alt: "Green valley" },
  { imgUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=700&fit=crop", alt: "Sunbeam nature" },
];

export default function Demo() {
  return (
    <div className="min-h-screen flex items-center">
      <SocialCards cards={DEMO_CARDS} />
    </div>
  );
}
