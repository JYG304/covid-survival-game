export const ART_ROOT = './assets';

export const FURNITURE_FILES = {
  bed: `${ART_ROOT}/furniture/bed.png`,
  tv: `${ART_ROOT}/furniture/tv.png`,
  stove: `${ART_ROOT}/furniture/stove.png`,
  closet: `${ART_ROOT}/furniture/closet.png`,
  door: `${ART_ROOT}/furniture/door.png`,
  desk: `${ART_ROOT}/furniture/desk.png`,
  chair: `${ART_ROOT}/furniture/chair.png`,
  sofa: `${ART_ROOT}/furniture/sofa.png`,
  shower: `${ART_ROOT}/furniture/shower.png`,
  rack: `${ART_ROOT}/furniture/rack.png`,
  pole: `${ART_ROOT}/furniture/pole.png`,
  atm: `${ART_ROOT}/furniture/atm.png`,
  counter: `${ART_ROOT}/furniture/counter.png`,
  fridge: `${ART_ROOT}/furniture/fridge.png`
};

export const BUILDING_FILES = {
  apartment: `${ART_ROOT}/buildings/apartment.png`,
  pharmacy: `${ART_ROOT}/buildings/pharmacy.png`,
  convenience: `${ART_ROOT}/buildings/convenience.png`,
  mall: `${ART_ROOT}/buildings/mall.png`,
  metro: `${ART_ROOT}/buildings/metro.png`,
  busStop: `${ART_ROOT}/buildings/bus-stop.png`,
  parlor: `${ART_ROOT}/buildings/parlor.png`,
  club: `${ART_ROOT}/buildings/club.png`,
  hospital: `${ART_ROOT}/buildings/hospital.png`,
  hotel: `${ART_ROOT}/buildings/hotel.png`,
  ktv: `${ART_ROOT}/buildings/ktv.png`,
  committee: `${ART_ROOT}/buildings/committee.png`,
  office: `${ART_ROOT}/buildings/office.png`,
  soy: `${ART_ROOT}/buildings/soy.png`,
  supermarket: `${ART_ROOT}/buildings/supermarket.png`,
  clothes: `${ART_ROOT}/buildings/clothes.png`,
  gate: `${ART_ROOT}/buildings/gate.png`
};

export const LANDMARK_SPRITE = {
  home_bed: 'bed',
  hotel_bed: 'bed',
  parlor_bed1: 'bed',
  parlor_bed2: 'bed',
  parlor_bed3: 'bed',
  home_tv: 'tv',
  hotel_tv: 'tv',
  metro_screen: 'tv',
  home_stove: 'stove',
  home_closet: 'closet',
  mall_fit: 'closet',
  home_door: 'door',
  home_exit: 'door',
  parlor_exit: 'door',
  hotel_exit: 'door',
  ktv_exit: 'door',
  store_exit: 'door',
  pharm_exit: 'door',
  mall_exit: 'door',
  comt_exit: 'door',
  lobby_exit: 'door',
  hosp_exit: 'door',
  off_lift: 'door',
  off_stair: 'door',
  home_desk: 'desk',
  off_desk: 'desk',
  parlor_desk: 'counter',
  pharm_counter: 'counter',
  comt_desk: 'desk',
  mall_atm: 'atm',
  store_atm: 'atm',
  home_shower: 'shower',
  hotel_bath: 'shower',
  club_bath: 'shower',
  ktv_bath: 'shower',
  parlor_wash: 'shower',
  mall_wc: 'shower',
  contactless_rack: 'rack',
  comt_box: 'rack',
  pharm_shelf: 'rack',
  store_fridge: 'fridge',
  metro_pole: 'pole',
  bus_stand: 'pole',
  club_vip: 'sofa',
  ktv_sofa: 'sofa',
  river_bench: 'chair',
  hosp_iv: 'chair',
  bus_seat: 'chair',
  metro_seat: 'chair'
};

export const LANDMARK_BUILDING = {
  living_home: 'apartment',
  street_pharmacy: 'pharmacy',
  street_convenience_store: 'convenience',
  com_mall: 'mall',
  com_market: 'supermarket',
  com_breakfast: 'soy',
  com_clothes: 'clothes',
  living_metro: 'metro',
  com_metro: 'metro',
  civ_metro: 'metro',
  cbd_metro: 'metro',
  red_metro: 'metro',
  living_bus: 'busStop',
  com_bus: 'busStop',
  civ_bus: 'busStop',
  cbd_bus: 'busStop',
  river_bus: 'busStop',
  massage_parlor: 'parlor',
  club_gate: 'club',
  hospital_gate: 'hospital',
  red_hotel: 'hotel',
  red_ktv: 'ktv',
  living_committee: 'committee',
  cbd_tower: 'office',
  living_to_commerce: 'gate',
  living_to_civic: 'gate',
  com_from_living: 'gate',
  com_to_cbd: 'gate',
  com_to_red: 'gate',
  red_from_com: 'gate',
  red_to_river: 'gate',
  red_to_living: 'gate',
  civ_from_living: 'gate',
  civ_to_cbd: 'gate',
  cbd_from_com: 'gate',
  cbd_from_civic: 'gate',
  cbd_to_river: 'gate',
  riv_from_red: 'gate',
  riv_from_cbd: 'gate',
  riv_to_living: 'gate'
};

export const SPRITE_ICON = {
  bed: '🛏️',
  tv: '📺',
  stove: '🍳',
  closet: '👔',
  door: '🚪',
  desk: '💻',
  chair: '🪑',
  sofa: '🛋️',
  shower: '🚿',
  rack: '📦',
  pole: '🪝',
  atm: '🏧',
  counter: '🧾',
  fridge: '🧊',
  apartment: '🏠',
  pharmacy: '💊',
  convenience: '🏪',
  mall: '🏬',
  metro: '🚇',
  busStop: '🚌',
  parlor: '💆',
  club: '🎵',
  hospital: '🏥',
  hotel: '🏨',
  ktv: '🎤',
  committee: '⛺',
  office: '🏢',
  soy: '🥣',
  supermarket: '🛒',
  clothes: '👕',
  gate: '➡️'
};

const imgCache = new Map();

export function tryImage(path) {
  if (!path) return null;
  if (imgCache.has(path)) return imgCache.get(path);
  const img = new Image();
  img.dataset.ok = '0';
  img.onload = () => { img.dataset.ok = '1'; };
  img.onerror = () => { img.dataset.ok = 'x'; };
  img.src = path;
  imgCache.set(path, img);
  return img;
}

export function drawIfReplaced(ctx, path, x, y, w, h) {
  const img = tryImage(path);
  if (img && img.dataset.ok === '1' && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
    return true;
  }
  return false;
}
