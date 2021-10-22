import { get } from 'https';
import { stringify } from 'querystring';
import { RequestParams, Response, ResponseClasses } from './types';
import ical, { ICalCalendar } from 'ical-generator';

export default class FitnessFirstIcalProxy {
    static async request(params: RequestParams): Promise<ICalCalendar> {
        const courses = await this.getCourses(params);
        return this.createCalendar(courses);
    }

    static async getCourses(params: RequestParams): Promise<ResponseClasses> {
        const q = stringify({
            club_id: this.paramToString(params.club_id),
            category_id: this.paramToString(params.category_id),
            class_id: this.paramToString(params.class_id),
            daytime_id: this.paramToString(params.daytime_id),
        });

        const response = await this.miniGet<Response>('https://www.fitnessfirst.de/kurse/kursplan/search?' + q);
        return response.data.classes;
    }

    static createCalendar(courses: ResponseClasses): ICalCalendar {
        const cal = ical({
            name: 'Fitness First',
            ttl: 60 * 60 * 6,
            prodId: {
                company: 'sebbo.net',
                product: 'fitness-first-ical-proxy'
            }
        });

        Object.entries(courses).forEach(([key, classes]) => {
            const day = key.split('_')[0];

            (Array.isArray(classes) ? classes : Object.values(classes)).forEach(courses => {
                courses.forEach(course => {
                    if (course.is_cancelled) {
                        return;
                    }

                    const start = new Date(day + 'T' + course.time.from + 'Z');
                    const end = new Date(day + 'T' + course.time.to + 'Z');

                    cal.createEvent({
                        id: course.id,
                        start,
                        end,
                        floating: true,
                        summary: course.title,
                        location: course.club,
                        url: course.url
                    });
                });
            });
        });

        return cal;
    }

    static paramToString(value: string | Array<string | number> | undefined): string {
        if (typeof value === 'string') {
            return value;
        }
        if(typeof value === 'undefined') {
            return '';
        }

        return value
            .map(v => v.toString())
            .join(',');
    }

    static async miniGet<T>(url: string): Promise<T> {
        return new Promise((resolve, reject) => {
            get(url, res => {
                const data: Uint8Array[] = [];

                res.on('data', chunk => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    const text = String(Buffer.concat(data));
                    if (res.statusCode !== 200) {
                        reject(new Error('Unable to get data: ' + text));
                        return;
                    }

                    const json = JSON.parse(text) as T;
                    resolve(json);
                });
            }).on('error', err => {
                reject(err);
            });
        });
    }
}
