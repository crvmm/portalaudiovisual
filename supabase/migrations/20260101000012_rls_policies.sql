-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_job_seeking ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posting_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posting_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posting_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posting_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posting_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_category_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Professional profiles: public read, owner write
CREATE POLICY "Professional profiles are public"
  ON professional_profiles FOR SELECT USING (TRUE);

CREATE POLICY "Professionals can manage own profile"
  ON professional_profiles FOR ALL USING (auth.uid() = id);

-- Professional related tables
CREATE POLICY "Public read professional job seeking"
  ON professional_job_seeking FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage professional job seeking"
  ON professional_job_seeking FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read professional categories"
  ON professional_categories FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage professional categories"
  ON professional_categories FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read professional specialties"
  ON professional_specialties FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage professional specialties"
  ON professional_specialties FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read professional languages"
  ON professional_languages FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage professional languages"
  ON professional_languages FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read professional tools"
  ON professional_tools FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage professional tools"
  ON professional_tools FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read professional equipment"
  ON professional_equipment FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage professional equipment"
  ON professional_equipment FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read professional links"
  ON professional_links FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage professional links"
  ON professional_links FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read work experiences"
  ON work_experiences FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage work experiences"
  ON work_experiences FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read educations"
  ON educations FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage educations"
  ON educations FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read portfolio items"
  ON portfolio_items FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage portfolio items"
  ON portfolio_items FOR ALL USING (auth.uid() = professional_id);

-- Company profiles
CREATE POLICY "Company profiles are public"
  ON company_profiles FOR SELECT USING (TRUE);
CREATE POLICY "Companies can manage own profile"
  ON company_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public read company social links"
  ON company_social_links FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage company social links"
  ON company_social_links FOR ALL USING (auth.uid() = company_id);

CREATE POLICY "Public read company projects"
  ON company_projects FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage company projects"
  ON company_projects FOR ALL USING (auth.uid() = company_id);

CREATE POLICY "Public read company gallery"
  ON company_gallery FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage company gallery"
  ON company_gallery FOR ALL USING (auth.uid() = company_id);

-- Individual profiles
CREATE POLICY "Individual profiles viewable by authenticated"
  ON individual_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Individuals manage own profile"
  ON individual_profiles FOR ALL USING (auth.uid() = id);

-- Services
CREATE POLICY "Active services are public"
  ON services FOR SELECT USING (is_active = TRUE OR auth.uid() = professional_id);
CREATE POLICY "Owner manage services"
  ON services FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Public read service media"
  ON service_media FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage service media"
  ON service_media FOR ALL USING (
    EXISTS (SELECT 1 FROM services s WHERE s.id = service_id AND s.professional_id = auth.uid())
  );

-- Availability: public read, owner write
CREATE POLICY "Availability is public"
  ON availability_slots FOR SELECT USING (TRUE);
CREATE POLICY "Owner manage availability"
  ON availability_slots FOR ALL USING (auth.uid() = professional_id);

-- Job postings: open ones are public
CREATE POLICY "Open job postings are public"
  ON job_postings FOR SELECT USING (status = 'open' OR auth.uid() = author_id);
CREATE POLICY "Authors manage job postings"
  ON job_postings FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Public read job posting categories"
  ON job_posting_categories FOR SELECT USING (TRUE);
CREATE POLICY "Authors manage job posting categories"
  ON job_posting_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );

CREATE POLICY "Public read job posting specialties"
  ON job_posting_specialties FOR SELECT USING (TRUE);
CREATE POLICY "Authors manage job posting specialties"
  ON job_posting_specialties FOR ALL USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );

CREATE POLICY "Public read job posting languages"
  ON job_posting_languages FOR SELECT USING (TRUE);
CREATE POLICY "Authors manage job posting languages"
  ON job_posting_languages FOR ALL USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );

CREATE POLICY "Public read job posting tools"
  ON job_posting_tools FOR SELECT USING (TRUE);
CREATE POLICY "Authors manage job posting tools"
  ON job_posting_tools FOR ALL USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );

CREATE POLICY "Public read job posting equipment"
  ON job_posting_equipment FOR SELECT USING (TRUE);
CREATE POLICY "Authors manage job posting equipment"
  ON job_posting_equipment FOR ALL USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );

-- Applications
CREATE POLICY "Applicants see own applications"
  ON applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Job authors see applications"
  ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );
CREATE POLICY "Professionals can apply"
  ON applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicants can update own application"
  ON applications FOR UPDATE USING (auth.uid() = applicant_id);
CREATE POLICY "Job authors can update application status"
  ON applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );

-- Chat: participants only
CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = id AND cp.profile_id = auth.uid())
  );
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Participants can view participation"
  ON conversation_participants FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.profile_id = auth.uid())
  );
CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.profile_id = auth.uid())
  );
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.profile_id = auth.uid())
  );

-- Reviews: public read, participants write
CREATE POLICY "Reviews are public"
  ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can leave reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications: own only
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users manage own notification preferences"
  ON notification_preferences FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Users manage own category filters"
  ON notification_category_filters FOR ALL USING (
    EXISTS (SELECT 1 FROM notification_preferences np WHERE np.id = preference_id AND np.profile_id = auth.uid())
  );

-- Job matches: professionals see own, job authors see all for their jobs
CREATE POLICY "Professionals see own matches"
  ON job_matches FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Job authors see matches for their jobs"
  ON job_matches FOR SELECT USING (
    EXISTS (SELECT 1 FROM job_postings j WHERE j.id = job_posting_id AND j.author_id = auth.uid())
  );

-- Reference data: public read
CREATE POLICY "Categories are public"
  ON categories FOR SELECT USING (status = 'active' OR submitted_by = auth.uid());
CREATE POLICY "Authenticated users can suggest categories"
  ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Specialties are public"
  ON specialties FOR SELECT USING (status = 'active' OR submitted_by = auth.uid());
CREATE POLICY "Authenticated users can suggest specialties"
  ON specialties FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tools are public"
  ON tools FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can add tools"
  ON tools FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Equipment is public"
  ON equipment FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can add equipment"
  ON equipment FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Languages are public"
  ON languages FOR SELECT USING (TRUE);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Portfolio media is publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "Users can upload portfolio media"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Company media is publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'company-media');
CREATE POLICY "Users can upload company media"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'company-media' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Service media is publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'service-media');
CREATE POLICY "Users can upload service media"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'service-media' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can access own documents"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Chat participants can access attachments"
  ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
