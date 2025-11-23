/**
 * 🌐 PUPPETEER WEB SCRAPER
 *
 * Real browser automation for web scraping
 * Enables Toobix to truly "see" and interact with websites
 */

// Note: This is a framework. Puppeteer needs to be installed:
// bun add puppeteer

// ============================================================================
// TYPES
// ============================================================================

export interface ScrapingJob {
  id: string;
  url: string;
  type: ScrapingType;
  selectors?: ScrapeSelectors;
  options: ScrapingOptions;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: ScrapingResult;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export type ScrapingType =
  | 'content'      // Extract text content
  | 'data'         // Extract structured data
  | 'screenshot'   // Take visual screenshot
  | 'interact'     // Click, fill forms, navigate
  | 'monitor';     // Monitor for changes

export interface ScrapeSelectors {
  title?: string;
  content?: string;
  links?: string;
  images?: string;
  data?: string[];
}

export interface ScrapingOptions {
  waitForSelector?: string;
  waitTime?: number; // ms
  screenshot?: boolean;
  javascript?: boolean;
  cookies?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export interface ScrapingResult {
  url: string;
  title?: string;
  content?: string;
  links?: string[];
  images?: string[];
  data?: any[];
  screenshot?: Buffer;
  metadata: {
    timestamp: Date;
    loadTime: number;
    success: boolean;
  };
}

// ============================================================================
// PUPPETEER SCRAPER ENGINE
// ============================================================================

export class PuppeteerScraperEngine {
  private browser: any = null; // Puppeteer Browser instance
  private queue: ScrapingJob[] = [];
  private activeJobs = new Map<string, ScrapingJob>();
  private completedJobs: ScrapingJob[] = [];

  constructor() {
    // Browser will be launched on first use
  }

  /**
   * Initialize Puppeteer browser
   */
  private async ensureBrowser(): Promise<void> {
    if (this.browser) return;

    console.log('🌐 Launching Puppeteer browser...');

    try {
      // Dynamically import puppeteer
      const puppeteer = await import('puppeteer');

      this.browser = await puppeteer.default.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      console.log('✅ Browser launched successfully');
    } catch (err) {
      console.error('❌ Failed to launch browser:', err);
      console.log('💡 Install Puppeteer with: bun add puppeteer');
      throw err;
    }
  }

  /**
   * Queue a scraping job
   */
  async queueScrape(
    url: string,
    type: ScrapingType,
    selectors?: ScrapeSelectors,
    options: ScrapingOptions = {}
  ): Promise<ScrapingJob> {
    const job: ScrapingJob = {
      id: `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      type,
      selectors,
      options: {
        waitTime: 2000,
        javascript: true,
        ...options,
      },
      status: 'pending',
    };

    this.queue.push(job);
    console.log(`📝 Queued scraping job: ${job.id} (${url})`);

    // Process queue
    this.processQueue();

    return job;
  }

  /**
   * Process scraping queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const job = this.queue.shift()!;
    job.status = 'running';
    job.startedAt = new Date();
    this.activeJobs.set(job.id, job);

    try {
      await this.ensureBrowser();
      const result = await this.executeScrape(job);

      job.result = result;
      job.status = 'completed';
      job.completedAt = new Date();

      console.log(`✅ Completed scraping: ${job.id}`);
    } catch (err: any) {
      job.status = 'failed';
      job.error = err.message;
      job.completedAt = new Date();

      console.error(`❌ Scraping failed: ${job.id}`, err.message);
    }

    this.activeJobs.delete(job.id);
    this.completedJobs.push(job);

    // Continue processing queue
    if (this.queue.length > 0) {
      setImmediate(() => this.processQueue());
    }
  }

  /**
   * Execute a scraping job
   */
  private async executeScrape(job: ScrapingJob): Promise<ScrapingResult> {
    const startTime = Date.now();
    const page = await this.browser.newPage();

    try {
      // Set user agent if specified
      if (job.options.userAgent) {
        await page.setUserAgent(job.options.userAgent);
      }

      // Set viewport if specified
      if (job.options.viewport) {
        await page.setViewport(job.options.viewport);
      }

      // Navigate to URL
      console.log(`🌐 Navigating to: ${job.url}`);
      await page.goto(job.url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Wait for specific selector if provided
      if (job.options.waitForSelector) {
        await page.waitForSelector(job.options.waitForSelector, {
          timeout: 10000,
        });
      }

      // Additional wait time
      if (job.options.waitTime) {
        await page.waitForTimeout(job.options.waitTime);
      }

      // Execute scraping based on type
      const result: ScrapingResult = {
        url: job.url,
        metadata: {
          timestamp: new Date(),
          loadTime: Date.now() - startTime,
          success: true,
        },
      };

      switch (job.type) {
        case 'content':
          result.title = await page.title();
          result.content = await page.evaluate(() => document.body.innerText);
          break;

        case 'data':
          if (job.selectors) {
            result.title = job.selectors.title
              ? await page.$eval(job.selectors.title, (el: any) => el.textContent)
              : await page.title();

            if (job.selectors.content) {
              result.content = await page.$eval(
                job.selectors.content,
                (el: any) => el.textContent
              );
            }

            if (job.selectors.links) {
              result.links = await page.$$eval(
                job.selectors.links,
                (els: any[]) => els.map(el => el.href)
              );
            }

            if (job.selectors.images) {
              result.images = await page.$$eval(
                job.selectors.images,
                (els: any[]) => els.map(el => el.src)
              );
            }

            if (job.selectors.data) {
              result.data = [];
              for (const selector of job.selectors.data) {
                const data = await page.$$eval(
                  selector,
                  (els: any[]) => els.map(el => el.textContent?.trim())
                );
                result.data.push(...data);
              }
            }
          }
          break;

        case 'screenshot':
          result.screenshot = await page.screenshot({
            fullPage: true,
          });
          result.title = await page.title();
          break;

        case 'interact':
          // Placeholder - would implement specific interactions
          result.title = await page.title();
          result.content = 'Interactive scraping not yet implemented';
          break;

        case 'monitor':
          // Placeholder - would implement change monitoring
          result.title = await page.title();
          result.content = await page.evaluate(() => document.body.innerText);
          break;
      }

      return result;

    } finally {
      await page.close();
    }
  }

  /**
   * Scrape multiple URLs in parallel
   */
  async scrapeMultiple(
    urls: string[],
    type: ScrapingType,
    options?: ScrapingOptions
  ): Promise<ScrapingJob[]> {
    const jobs: ScrapingJob[] = [];

    for (const url of urls) {
      const job = await this.queueScrape(url, type, undefined, options);
      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): ScrapingJob | undefined {
    return this.activeJobs.get(jobId) ||
           this.completedJobs.find(j => j.id === jobId);
  }

  /**
   * Get all completed jobs
   */
  getCompletedJobs(): ScrapingJob[] {
    return this.completedJobs;
  }

  /**
   * Statistics
   */
  getStatistics() {
    return {
      queuedJobs: this.queue.length,
      activeJobs: this.activeJobs.size,
      completedJobs: this.completedJobs.length,
      successfulJobs: this.completedJobs.filter(j => j.status === 'completed').length,
      failedJobs: this.completedJobs.filter(j => j.status === 'failed').length,
    };
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🌐 Browser closed');
    }
  }
}

// ============================================================================
// SMART SCRAPING STRATEGIES
// ============================================================================

export class SmartScrapingStrategy {
  constructor(private scraper: PuppeteerScraperEngine) {}

  /**
   * Scrape a news website intelligently
   */
  async scrapeNews(url: string): Promise<ScrapingResult | undefined> {
    const job = await this.scraper.queueScrape(url, 'data', {
      title: 'h1, .article-title, .headline',
      content: 'article, .article-content, .story-body',
      images: 'article img, .article-image',
      links: 'article a',
    }, {
      waitTime: 3000,
      javascript: true,
    });

    // Wait for completion (simplified)
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const completedJob = this.scraper.getJob(job.id);
        if (completedJob && completedJob.status !== 'running' && completedJob.status !== 'pending') {
          clearInterval(checkInterval);
          resolve(completedJob.result);
        }
      }, 500);
    });
  }

  /**
   * Scrape product information from e-commerce
   */
  async scrapeProduct(url: string): Promise<ScrapingResult | undefined> {
    const job = await this.scraper.queueScrape(url, 'data', {
      title: 'h1, .product-title, [itemprop="name"]',
      content: '.product-description, [itemprop="description"]',
      data: ['.price, [itemprop="price"]', '.rating, [itemprop="ratingValue"]'],
      images: '.product-image img, [itemprop="image"]',
    });

    return this.waitForJob(job.id);
  }

  /**
   * Monitor a page for changes
   */
  async monitorForChanges(url: string, checkInterval: number = 60000): Promise<void> {
    let previousContent = '';

    const check = async () => {
      const result = await this.scrapeNews(url);
      if (result && result.content !== previousContent) {
        console.log(`🔔 Change detected on ${url}`);

        // Notify via Proactive Communication
        try {
          await fetch('http://localhost:8950/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'discovery',
              title: 'Website Changed',
              body: `Detected changes on ${url}`,
              priority: 'medium',
              source: 'Puppeteer Scraper',
            }),
          });
        } catch (err) {
          console.log('Could not send notification');
        }

        previousContent = result.content || '';
      }
    };

    // Check immediately
    await check();

    // Then check periodically
    setInterval(check, checkInterval);
  }

  private async waitForJob(jobId: string): Promise<ScrapingResult | undefined> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const job = this.scraper.getJob(jobId);
        if (job && job.status !== 'running' && job.status !== 'pending') {
          clearInterval(checkInterval);
          resolve(job.result);
        }
      }, 500);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(undefined);
      }, 30000);
    });
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  PuppeteerScraperEngine,
  SmartScrapingStrategy,
};
