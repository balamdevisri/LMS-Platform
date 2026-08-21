import { GITHUB_URL_REGEX } from '../../validators/student.validator';

export interface GitHubUserProfileData {
  username: string;
  profileUrl: string;
  avatar: string;
  bio: string;
  company: string;
  location: string;
  website: string;
  twitter: string;
  followers: number;
  following: number;
  repositories: number;
  joinedDate: string;
  lastUpdated: string;
}

export interface GitHubRepoData {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  visibility: string;
  url: string;
  updatedDate: string;
}

export class GitHubService {
  /**
   * Extracts the GitHub username from a full profile URL
   * e.g., https://github.com/KH2KGaming -> KH2KGaming
   */
  public static extractUsername(githubUrl: string): string {
    if (!githubUrl) {
      throw new Error('GitHub Profile URL is required');
    }
    const cleanUrl = githubUrl.trim().replace(/\/+$/, '');
    const match = cleanUrl.match(GITHUB_URL_REGEX);
    if (!match || !match[1]) {
      throw new Error('Invalid GitHub Profile URL. Must be in format https://github.com/username');
    }
    return match[1];
  }

  /**
   * Fetches GitHub user profile from GitHub REST API
   * GET https://api.github.com/users/{username}
   */
  public static async fetchUserProfile(username: string): Promise<GitHubUserProfileData> {
    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'KaizenQ-LMS-Platform',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.status === 404) {
        throw new Error('Invalid GitHub Profile');
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
      }
      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      return {
        username: data.login,
        profileUrl: data.html_url || `https://github.com/${data.login}`,
        avatar: data.avatar_url || '',
        bio: data.bio || '',
        company: data.company || '',
        location: data.location || '',
        website: data.blog || '',
        twitter: data.twitter_username || '',
        followers: typeof data.followers === 'number' ? data.followers : 0,
        following: typeof data.following === 'number' ? data.following : 0,
        repositories: typeof data.public_repos === 'number' ? data.public_repos : 0,
        joinedDate: data.created_at || new Date().toISOString(),
        lastUpdated: data.updated_at || new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch GitHub profile data');
    }
  }

  /**
   * Fetches public repositories for a GitHub user
   * GET https://api.github.com/users/{username}/repos
   */
  public static async fetchUserRepos(username: string): Promise<GitHubRepoData[]> {
    try {
      const url = new URL(`https://api.github.com/users/${encodeURIComponent(username)}/repos`);
      url.searchParams.set('sort', 'updated');
      url.searchParams.set('direction', 'desc');
      url.searchParams.set('per_page', '10');

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'KaizenQ-LMS-Platform',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((repo: any) => ({
        name: repo.name || '',
        description: repo.description || '',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || 'Plain Text',
        visibility: repo.visibility || (repo.private ? 'private' : 'public'),
        url: repo.html_url || '',
        updatedDate: repo.updated_at || new Date().toISOString(),
      }));
    } catch (error: any) {
      console.warn(`GitHubService: Failed to fetch repos for ${username}:`, error?.message || error);
      return [];
    }
  }
}
