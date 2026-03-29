import { supabase } from "@/integrations/supabase/client";

export type LandingTrader = {
  id: string;
  name: string;
  country: string;
  flag: string;
  win_rate: number;
  total_profit: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type LandingInvestor = {
  id: string;
  name: string;
  country: string;
  portfolio_value: string;
  monthly_profit: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type LandingTestimonial = {
  id: string;
  name: string;
  country: string;
  review: string;
  rating: number;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
};

const TABLE_TRADERS = "landing_traders" as any;
const TABLE_INVESTORS = "landing_investors" as any;
const TABLE_TESTIMONIALS = "landing_testimonials" as any;

// ── Traders ──
export const fetchTraders = async (): Promise<LandingTrader[]> => {
  const { data, error } = await supabase
    .from(TABLE_TRADERS)
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as LandingTrader[];
};

export const fetchAllTraders = async (): Promise<LandingTrader[]> => {
  const { data, error } = await supabase
    .from(TABLE_TRADERS)
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as LandingTrader[];
};

export const upsertTrader = async (trader: Partial<LandingTrader> & { name: string; country: string; flag: string }) => {
  const { error } = await supabase.from(TABLE_TRADERS).upsert(trader as any);
  if (error) throw error;
};

export const deleteTrader = async (id: string) => {
  const { error } = await supabase.from(TABLE_TRADERS).delete().eq("id", id);
  if (error) throw error;
};

// ── Investors ──
export const fetchInvestors = async (): Promise<LandingInvestor[]> => {
  const { data, error } = await supabase
    .from(TABLE_INVESTORS)
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as LandingInvestor[];
};

export const fetchAllInvestors = async (): Promise<LandingInvestor[]> => {
  const { data, error } = await supabase
    .from(TABLE_INVESTORS)
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as LandingInvestor[];
};

export const upsertInvestor = async (inv: Partial<LandingInvestor> & { name: string; country: string }) => {
  const { error } = await supabase.from(TABLE_INVESTORS).upsert(inv as any);
  if (error) throw error;
};

export const deleteInvestor = async (id: string) => {
  const { error } = await supabase.from(TABLE_INVESTORS).delete().eq("id", id);
  if (error) throw error;
};

// ── Testimonials ──
export const fetchTestimonials = async (): Promise<LandingTestimonial[]> => {
  const { data, error } = await supabase
    .from(TABLE_TESTIMONIALS)
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as LandingTestimonial[];
};

export const fetchAllTestimonials = async (): Promise<LandingTestimonial[]> => {
  const { data, error } = await supabase
    .from(TABLE_TESTIMONIALS)
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as LandingTestimonial[];
};

export const upsertTestimonial = async (t: Partial<LandingTestimonial> & { name: string; country: string; review: string }) => {
  const { error } = await supabase.from(TABLE_TESTIMONIALS).upsert(t as any);
  if (error) throw error;
};

export const deleteTestimonial = async (id: string) => {
  const { error } = await supabase.from(TABLE_TESTIMONIALS).delete().eq("id", id);
  if (error) throw error;
};

// ── Photo upload ──
export const uploadLandingPhoto = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("landing-assets").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("landing-assets").getPublicUrl(path);
  return data.publicUrl;
};
