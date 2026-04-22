import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const MAPPING: Record<string, string> = {
  "Aircon": "https://images.unsplash.com/photo-1621905252507-b354bc2caff4?auto=format&fit=crop&q=80&w=200",
  "Apple": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=200",
  "Camera": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200",
  "Laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=200",
  "Microphone": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=200",
  "Speaker": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=200",
  "Projector": "https://images.unsplash.com/photo-1535016120720-40c646bebbfc?auto=format&fit=crop&q=80&w=200",
  "Tablet": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=200",
  "Keyboard": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=200",
  "Instrument": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=200",
  "Cables": "https://images.unsplash.com/photo-1558439062-a3381f924d55?auto=format&fit=crop&q=80&w=200",
  "Tripod": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200",
};

async function populate() {
  console.log("Fetching assets...");
  const { data: assets, error } = await supabase.from('assets').select('id, name, item_types(name)');
  
  if (error) {
    console.error("Error fetching assets:", error);
    return;
  }

  console.log(`Found ${assets.length} assets. Updating images...`);

  for (const asset of assets) {
    const division = (asset as any).item_types?.name || "";
    let url = "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=200"; // Default box

    for (const [key, val] of Object.entries(MAPPING)) {
      if (division.toLowerCase().includes(key.toLowerCase()) || asset.name.toLowerCase().includes(key.toLowerCase())) {
        url = val;
        break;
      }
    }

    const { error: updErr } = await supabase
      .from('assets')
      .update({ image_url: url } as any)
      .eq('id', asset.id);

    if (updErr) console.error(`Failed to update ${asset.name}:`, updErr.message);
    else process.stdout.write(".");
  }

  console.log("\nDone!");
}

populate();
