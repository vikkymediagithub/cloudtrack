-- Create a system admin user first (this will be used for seeding data)
DO $$
DECLARE
    system_user_id UUID;
    existing_user_count INTEGER;
BEGIN
    -- Check if we have any users
    SELECT COUNT(*) INTO existing_user_count FROM public.users;
    
    -- Only proceed if we have users or create a system user
    IF existing_user_count = 0 THEN
        -- Create a system user for seeding (this would normally be created through registration)
        -- In a real scenario, you'd register through the app first
        RAISE NOTICE 'No users found. Please register a user through the application first, then run this script again.';
        RETURN;
    END IF;
    
    -- Get the first user (or a specific admin user)
    SELECT id INTO system_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
    
    -- If no admin, use any user
    IF system_user_id IS NULL THEN
        SELECT id INTO system_user_id FROM public.users LIMIT 1;
    END IF;
    
    -- Only insert sample data if no projects exist
    IF NOT EXISTS (SELECT 1 FROM public.projects LIMIT 1) THEN
        -- Insert sample projects
        INSERT INTO public.projects (name, description, status, created_by, deadline, progress) VALUES
        ('CloudTrack Development', 'Building the CloudTrack task management platform', 'active', system_user_id, '2024-03-15', 75),
        ('Mobile App Development', 'Cross-platform mobile app using React Native', 'active', system_user_id, '2024-02-28', 45),
        ('Database Migration', 'Migrating legacy database to PostgreSQL', 'pending', system_user_id, '2024-04-10', 20),
        ('API Documentation', 'Creating comprehensive API documentation', 'completed', system_user_id, '2024-01-20', 100),
        ('Security Audit', 'Comprehensive security review and improvements', 'active', system_user_id, '2024-05-01', 30);
        
        RAISE NOTICE 'Sample projects created successfully!';
    END IF;
    
    -- Insert sample tasks if projects exist
    IF EXISTS (SELECT 1 FROM public.projects WHERE name = 'CloudTrack Development') THEN
        INSERT INTO public.tasks (project_id, title, description, status, priority, due_date) 
        SELECT 
            p.id,
            'Setup Authentication System',
            'Implement user authentication with Supabase',
            'completed',
            'high',
            '2024-01-15'
        FROM public.projects p 
        WHERE p.name = 'CloudTrack Development'
        AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Setup Authentication System');
        
        INSERT INTO public.tasks (project_id, title, description, status, priority, due_date) 
        SELECT 
            p.id,
            'Build Dashboard Components',
            'Create role-based dashboard interfaces',
            'in-progress',
            'high',
            '2024-01-25'
        FROM public.projects p 
        WHERE p.name = 'CloudTrack Development'
        AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Build Dashboard Components');
        
        INSERT INTO public.tasks (project_id, title, description, status, priority, due_date) 
        SELECT 
            p.id,
            'Implement Real-time Features',
            'Add live notifications and updates',
            'pending',
            'medium',
            '2024-02-01'
        FROM public.projects p 
        WHERE p.name = 'CloudTrack Development'
        AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE title = 'Implement Real-time Features');
        
        RAISE NOTICE 'Sample tasks created successfully!';
    END IF;
    
    -- Insert sample reports if projects exist
    IF EXISTS (SELECT 1 FROM public.projects WHERE name = 'CloudTrack Development') THEN
        INSERT INTO public.reports (project_id, submitted_by, content, type, status)
        SELECT 
            p.id,
            system_user_id,
            'Weekly Progress Report: Completed authentication system setup and started working on dashboard components. The authentication flow is working properly with role-based access control. Next week will focus on completing the dashboard interfaces and beginning real-time feature implementation.',
            'weekly',
            'submitted'
        FROM public.projects p 
        WHERE p.name = 'CloudTrack Development'
        AND NOT EXISTS (SELECT 1 FROM public.reports WHERE content LIKE '%Weekly Progress Report%');
        
        INSERT INTO public.reports (project_id, submitted_by, content, type, status)
        SELECT 
            p.id,
            system_user_id,
            'Milestone Report: Authentication and basic dashboard functionality completed. All user roles (admin, staff, intern) can now access their respective dashboards with appropriate permissions. Database schema is finalized and all CRUD operations are working correctly.',
            'milestone',
            'reviewed'
        FROM public.projects p 
        WHERE p.name = 'CloudTrack Development'
        AND NOT EXISTS (SELECT 1 FROM public.reports WHERE content LIKE '%Milestone Report%');
        
        RAISE NOTICE 'Sample reports created successfully!';
    END IF;
    
    -- Insert sample notes if projects exist
    IF EXISTS (SELECT 1 FROM public.projects WHERE name = 'CloudTrack Development') THEN
        INSERT INTO public.notes (project_id, created_by, title, content, visibility)
        SELECT 
            p.id,
            system_user_id,
            'API Endpoints Documentation',
            'Complete list of all API endpoints:
            
            Authentication:
            - POST /auth/signup - User registration
            - POST /auth/signin - User login
            - POST /auth/signout - User logout
            
            Projects:
            - GET /api/projects - List all projects
            - POST /api/projects - Create new project
            - PUT /api/projects/:id - Update project
            - DELETE /api/projects/:id - Delete project
            
            Tasks:
            - GET /api/tasks - List all tasks
            - POST /api/tasks - Create new task
            - PUT /api/tasks/:id - Update task
            - DELETE /api/tasks/:id - Delete task',
            'team'
        FROM public.projects p 
        WHERE p.name = 'CloudTrack Development'
        AND NOT EXISTS (SELECT 1 FROM public.notes WHERE title = 'API Endpoints Documentation');
        
        INSERT INTO public.notes (project_id, created_by, title, content, visibility)
        SELECT 
            p.id,
            system_user_id,
            'Development Guidelines',
            'Important development guidelines for the CloudTrack project:
            
            1. Code Style: Use TypeScript strict mode and follow ESLint rules
            2. Components: Use shadcn/ui components for consistency
            3. Database: All operations must go through Supabase with proper RLS
            4. Authentication: Always check user permissions before operations
            5. Error Handling: Provide user-friendly error messages
            6. Testing: Write tests for all new features
            7. Documentation: Update docs for any API changes',
            'team'
        FROM public.projects p 
        WHERE p.name = 'CloudTrack Development'
        AND NOT EXISTS (SELECT 1 FROM public.notes WHERE title = 'Development Guidelines');
        
        RAISE NOTICE 'Sample notes created successfully!';
    END IF;
    
    -- Insert sample notifications for all users
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT 
        u.id,
        'Welcome to CloudTrack!',
        'Your account has been set up successfully. Explore your dashboard to get started with project management.',
        'info'
    FROM public.users u
    WHERE NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.user_id = u.id AND n.title = 'Welcome to CloudTrack!'
    );
    
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT 
        u.id,
        'New Project Available',
        'You have been assigned to the CloudTrack Development project. Check your dashboard for details.',
        'success'
    FROM public.users u
    WHERE NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.user_id = u.id AND n.title = 'New Project Available'
    );
    
    RAISE NOTICE 'Sample notifications created successfully!';
    
    -- Final success message
    RAISE NOTICE 'All sample data has been created successfully! You now have:';
    RAISE NOTICE '- % projects', (SELECT COUNT(*) FROM public.projects);
    RAISE NOTICE '- % tasks', (SELECT COUNT(*) FROM public.tasks);
    RAISE NOTICE '- % reports', (SELECT COUNT(*) FROM public.reports);
    RAISE NOTICE '- % notes', (SELECT COUNT(*) FROM public.notes);
    RAISE NOTICE '- % notifications', (SELECT COUNT(*) FROM public.notifications);
    
END $$;

-- Final verification
SELECT 
    'Database seeding completed successfully!' as status,
    (SELECT COUNT(*) FROM public.users) as users_count,
    (SELECT COUNT(*) FROM public.projects) as projects_count,
    (SELECT COUNT(*) FROM public.tasks) as tasks_count,
    (SELECT COUNT(*) FROM public.reports) as reports_count,
    (SELECT COUNT(*) FROM public.notes) as notes_count,
    (SELECT COUNT(*) FROM public.notifications) as notifications_count;
