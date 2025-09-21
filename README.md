# Model Management System

A web-based model management system built with HTML, CSS, JavaScript, and Supabase.

## 🚀 Features

- **User Authentication**: Login/signup with email/password and Google OAuth
- **Profile Management**: Create, view, edit, and delete model profiles
- **Admin Dashboard**: Admin-only access to manage all submissions
- **File Upload**: Image upload functionality for model photos
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization with Supabase

## 📁 Project Structure

```
├── index.html              # Main form page
├── login.html              # Authentication page
├── admin.html              # Admin dashboard
├── models.html             # Public models view
├── modeldetails.html       # Individual model details
├── submission-details.html # User's submission view
├── user-access.html        # Access existing submission
├── admin-link.html         # Admin access page
├── thankyou.html           # Success page
├── instructions.html       # Form instructions
├── measurements.html       # Measurement guide
├── picturesupload.html     # Photo upload page
├── style.css              # Main stylesheet
├── login.css              # Login page styles
├── admin.css              # Admin page styles
├── contact.js             # Form handling
├── auth.js                # Authentication logic
├── admin.js               # Admin functionality
├── models.js              # Models page logic
├── modeldetails.js        # Model details logic
├── picturesupload.js      # Photo upload logic
├── measurements.js        # Measurement guide logic
├── config.example.js      # Configuration template
└── my-background.jpg      # Background image
```

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd model-management-system
```

### 2. Configure Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. **For deployment**: The project includes `config.public.js` with your Supabase credentials (anon key is safe to be public)
3. **For local development**: Copy `config.example.js` to `config.js` and update with your credentials
   ```javascript
   export const SUPABASE_URL = "your-supabase-url";
   export const SUPABASE_ANON_KEY = "your-anon-key";
   export const STORAGE_BUCKET = "uploads";
   ```

### 3. Database Setup
Run the following SQL commands in your Supabase SQL editor:

```sql
-- Create submissions table
CREATE TABLE public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  city text NOT NULL,
  landmark text NOT NULL,
  insta text NOT NULL,
  whatsapp text NOT NULL,
  age smallint NOT NULL,
  chest numeric NOT NULL,
  bust numeric NOT NULL,
  waist numeric NOT NULL,
  hips numeric NOT NULL,
  height_feet numeric NOT NULL,
  height_inches numeric NOT NULL,
  glam_makeup boolean NOT NULL,
  photo_paths text[] DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id),
  saved_at timestamp with time zone DEFAULT now()
);

-- Create model_status table
CREATE TABLE public.model_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
  working boolean DEFAULT false,
  saved_at timestamp with time zone DEFAULT now(),
  UNIQUE(submission_id)
);

-- Create model_notes table
CREATE TABLE public.model_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
  content text,
  saved_at timestamp with time zone DEFAULT now(),
  UNIQUE(submission_id)
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "authenticated_users_can_insert_submissions" ON public.submissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "anyone_can_view_submissions" ON public.submissions
  FOR SELECT USING (true);

CREATE POLICY "users_can_update_own_submissions" ON public.submissions
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

CREATE POLICY "users_can_delete_own_submissions" ON public.submissions
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    (user_id IS NULL OR user_id = auth.uid())
  );
```

### 4. Storage Setup
1. Create a storage bucket named `uploads` in Supabase
2. Set the bucket to public
3. Configure storage policies for authenticated users

### 5. Authentication Setup
1. Enable email/password authentication in Supabase
2. Configure Google OAuth (optional)
3. Set up redirect URLs in Supabase Auth settings

### 6. Run the Application
```bash
# Start a local server
python -m http.server 3000

# Or use any other local server
# Open http://localhost:3000 in your browser
```

## 🔐 Admin Access

Admin access is restricted to specific email addresses:
- `admin@example.com`
- `nikhil.dg2003@gmail.com`

To add more admins, update the admin email checks in the JavaScript files.

## 🌐 Deployment

### GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://yourusername.github.io/repository-name`

### Other Hosting Services
- **Netlify**: Drag and drop your project folder
- **Vercel**: Connect your GitHub repository
- **Supabase Hosting**: Use Supabase's built-in hosting

## 📱 Usage

1. **For Users**: Visit the main page to submit your model profile
2. **For Admins**: Use the admin login to access the dashboard
3. **View Models**: Browse all submitted models publicly

## 🔧 Configuration

- **For deployment**: Uses `config.public.js` (already configured)
- **For local development**: Update `config.js` with your Supabase credentials
- Modify admin emails in the authentication logic
- Customize styling in the CSS files
- Adjust form fields in the HTML files

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.
