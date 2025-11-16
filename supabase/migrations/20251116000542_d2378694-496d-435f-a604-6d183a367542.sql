-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Profile settings table
CREATE TABLE public.profile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'Shashikant Kataria',
  bio TEXT,
  profile_image_url TEXT,
  resume_url TEXT,
  phone TEXT,
  email TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  kofi_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;

-- Insert default profile
INSERT INTO public.profile_settings (full_name, email, phone) 
VALUES ('Shashikant Kataria', 'shashi007.iitkgp@gmail.com', '+91 6378454339');

CREATE POLICY "Anyone can view profile"
  ON public.profile_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update profile"
  ON public.profile_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  proficiency INTEGER DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage skills"
  ON public.skills FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Experiences table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  technologies TEXT[],
  link TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view experiences"
  ON public.experiences FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage experiences"
  ON public.experiences FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  technologies TEXT[],
  github_url TEXT,
  live_url TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage projects"
  ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage achievements"
  ON public.achievements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- PORs (Positions of Responsibility) table
CREATE TABLE public.pors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pors"
  ON public.pors FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage pors"
  ON public.pors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  replied_at TIMESTAMPTZ
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view contacts"
  ON public.contact_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update contacts"
  ON public.contact_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profile_settings
CREATE TRIGGER update_profile_settings_updated_at
  BEFORE UPDATE ON public.profile_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();