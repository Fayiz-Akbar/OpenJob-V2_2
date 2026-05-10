require('dotenv').config();
const express = require('express');
const ClientError = require('./exceptions/ClientError');
const verifyToken = require('./middlewares/auth'); 
const { Pool } = require('pg'); 

// =======================================================
// 1. IMPORT SERVICES, VALIDATORS, & HANDLERS
// =======================================================
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');
const usersRoutes = require('./api/users/routes');
const UsersHandler = require('./api/users/handler');

const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const authenticationsRoutes = require('./api/authentications/routes');
const AuthenticationsHandler = require('./api/authentications/handler');

const CompaniesService = require('./services/postgres/CompaniesService');
const CompaniesValidator = require('./validator/companies');
const companiesRoutes = require('./api/companies/routes');
const CompaniesHandler = require('./api/companies/handler');

const CategoriesService = require('./services/postgres/CategoriesService');
const CategoriesValidator = require('./validator/categories');
const categoriesRoutes = require('./api/categories/routes');
const CategoriesHandler = require('./api/categories/handler');

const JobsService = require('./services/postgres/JobsService');
const JobsValidator = require('./validator/jobs');
const jobsRoutes = require('./api/jobs/routes');
const JobsHandler = require('./api/jobs/handler');

const ApplicationsService = require('./services/postgres/ApplicationsService');
const ApplicationsValidator = require('./validator/applications');
const applicationsRoutes = require('./api/applications/routes');
const ApplicationsHandler = require('./api/applications/handler');

const BookmarksService = require('./services/postgres/BookmarksService');
const BookmarksValidator = require('./validator/bookmarks');
const bookmarksRoutes = require('./api/bookmarks/routes');
const BookmarksHandler = require('./api/bookmarks/handler');

const profilesRoutes = require('./api/profiles/routes');
const ProfilesHandler = require('./api/profiles/handler');

const documentsRouter = require('./api/documents/routes');
const path = require('path'); 

const CacheService = require('./services/redis/CacheService');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.use(express.json());

// =======================================================
// 2. INSTANSIASI SERVICE & REGISTER ROUTES UTAMA
// =======================================================
const pool = new Pool();
const cacheService = new CacheService();

const usersService = new UsersService(pool, cacheService);
const usersHandler = new UsersHandler(usersService, UsersValidator);
app.use('/users', usersRoutes(usersHandler));

const authenticationsService = new AuthenticationsService();
const authenticationsHandler = new AuthenticationsHandler(authenticationsService, usersService, TokenManager, AuthenticationsValidator);
app.use('/authentications', authenticationsRoutes(authenticationsHandler));

const companiesService = new CompaniesService(pool, cacheService);
const companiesHandler = new CompaniesHandler(companiesService, CompaniesValidator);
app.use('/companies', companiesRoutes(companiesHandler));

const categoriesService = new CategoriesService(cacheService);
const categoriesHandler = new CategoriesHandler(categoriesService, CategoriesValidator);
app.use('/categories', categoriesRoutes(categoriesHandler));

const jobsService = new JobsService(cacheService);
const jobsHandler = new JobsHandler(jobsService, JobsValidator);
app.use('/jobs', jobsRoutes(jobsHandler));

const applicationsService = new ApplicationsService(cacheService);
const applicationsHandler = new ApplicationsHandler(applicationsService, ApplicationsValidator);
app.use('/applications', applicationsRoutes(applicationsHandler));

const bookmarksService = new BookmarksService(cacheService);
const bookmarksHandler = new BookmarksHandler(bookmarksService, BookmarksValidator);
app.use('/bookmarks', bookmarksRoutes(bookmarksHandler));

const profilesHandler = new ProfilesHandler(usersService, applicationsService, bookmarksService);
app.use('/profile', profilesRoutes(profilesHandler));

app.use('/documents', documentsRouter);
app.use('/uploads/documents', express.static(path.resolve(__dirname, '../uploads/documents')));

// =======================================================
// 3. JALUR ALTERNATIF BOOKMARKS (Penjinak Test Postman)
// =======================================================

app.post('/jobs/:jobId/bookmark', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;
    const bookmarkId = await bookmarksService.addBookmark(userId, jobId);
    res.status(201).json({ status: 'success', data: { id: bookmarkId } });
  } catch (error) { next(error); }
});

app.delete('/jobs/:jobId/bookmark', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;
    
    const { bookmarks } = await bookmarksService.getBookmarksByUserId(userId);
    
    const target = bookmarks.find(b => b.job_id === jobId);
    
    if (!target) {
      throw new ClientError('Bookmark tidak ditemukan', 404);
    }
    
    await bookmarksService.deleteBookmarkById(target.id);
    res.status(200).json({ status: 'success', message: 'Bookmark berhasil dihapus' });
  } catch (error) { next(error); }
});

app.get('/jobs/:jobId/bookmark/:bookmarkId', verifyToken, async (req, res, next) => {
  try {
    const id = req.params.bookmarkId;
    const bookmark = await bookmarksService.getBookmarkById(id);
    res.status(200).json({ status: 'success', data: bookmark });
  } catch (error) { next(error); }
});


// =======================================================
// 4. GLOBAL ERROR HANDLING 
// =======================================================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'failed',
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });
});

app.listen(port, host, () => {
  console.log(`Server berjalan pada http://${host}:${port}`);
});