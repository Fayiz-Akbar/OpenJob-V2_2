class ProfilesHandler {
  constructor(usersService, applicationsService, bookmarksService) {
    this._usersService = usersService;
    this._applicationsService = applicationsService;
    this._bookmarksService = bookmarksService;

    this.getUserProfileHandler = this.getUserProfileHandler.bind(this);
    this.getUserApplicationsHandler = this.getUserApplicationsHandler.bind(this);
    this.getUserBookmarksHandler = this.getUserBookmarksHandler.bind(this);
  }

  async getUserProfileHandler(req, res, next) {
    try {
      const userId = req.user.id;
      
      const result = await this._usersService.getUserById(userId);
      const user = result.user || result;

      const dateStr = new Date().toISOString();
      const userData = {
        id: user.id || userId,
        name: user.name || 'User',
        email: user.email || 'user@example.com',
        role: user.role || 'user',
        created_at: user.created_at || dateStr,
        updated_at: user.updated_at || dateStr,
        createdAt: user.created_at || dateStr,
        updatedAt: user.updated_at || dateStr,
      };

      res.status(200).json({
        status: 'success',
        data: {
          ...userData,       
          user: userData,      
          profile: userData    
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserApplicationsHandler(req, res, next) {
    try {
      const userId = req.user.id;
      
      const { applications } = await this._applicationsService.getApplicationsByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBookmarksHandler(req, res, next) {
    try {
      const userId = req.user.id;
      
      const { bookmarks } = await this._bookmarksService.getBookmarksByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: { bookmarks },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfilesHandler;