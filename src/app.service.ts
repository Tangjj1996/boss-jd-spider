import { Inject, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { get } from 'lodash';
import { Job } from './entities/Job';
import { EntityManager } from 'typeorm';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async startSpider() {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 0,
        height: 0,
      },
    });
    const page = await browser.newPage();

    await page.goto(
      'https://www.zhipin.com/web/geek/job?query=前端&city=100010000',
    );

    await page.waitForSelector('.job-list-box');

    const totalPage = await page.$eval(
      '.option-pages a:nth-last-child(2)',
      (el) => {
        return parseInt(el.textContent);
      },
    );

    const allJobs = [];

    for (let i = 1; i <= totalPage; i++) {
      await page.goto(
        `https://www.zhipin.com/web/geek/job?query=前端&city=100010000&page=${i}`,
      );

      await page.waitForSelector('.job-list-box');

      const jobs = await page.$eval('.job-list-box', (el) => {
        return [...el.querySelectorAll('.job-card-wrapper')].map((item) => {
          return {
            job: {
              name: item.querySelector('.job-name').textContent,
              area: item.querySelector('.job-area').textContent,
              salary: item.querySelector('.salary').textContent,
            },
            link: item.querySelector('a').href,
            company: {
              name: item.querySelector('.company-name').textContent,
            },
          };
        });
      });

      allJobs.push(...jobs);
    }

    for (let i = 0; i < allJobs.length; i++) {
      await page.goto(allJobs[i].link);

      try {
        await page.waitForSelector('.job-sec-text');

        const jd = await page.$eval('.job-sec-text', (el) => {
          return el.textContent;
        });

        allJobs[i].desc = jd;

        const job = new Job();
        job.name = get(allJobs, [i, 'job', 'name']);
        job.area = get(allJobs, [i, 'job', 'area']);
        job.salary = get(allJobs, [i, 'job', 'salary']);
        job.link = get(allJobs, [i, 'job', 'link']);
        job.company = get(allJobs, [i, 'job', 'company']);
        job.desc = get(allJobs, [i, 'job', 'desc']);
        await this.entityManager.save(Job, job);
      } catch (_e) {}
    }
  }

  @Inject(EntityManager)
  private entityManager: EntityManager;
}
