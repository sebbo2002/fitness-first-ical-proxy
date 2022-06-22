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

        // Kinderschwimmen @ Gendarmenmarkt
        if (params.club_id === '0115' && (params.category_id === '431' || !params.category_id)) {
            Object.entries(response.data.classes).forEach(([key, classes]) => {
                if (key.split('_', 2)[1] === 'sa') {
                    const event = {
                        id: `kinderschwimmen-${key}`,
                        title: 'Kinderschwimmen',
                        time: {
                            from: '09:00:00',
                            to: '12:15:00'
                        },
                        category: 'Aqua',
                        categoryIcon: 'https://www.fitnessfirst.de/sites/g/files/tbchtk201/files/2020-10/fitness-first-kurse-special.png',
                        level: 'Alle',
                        club: 'Berlin - Gendarmenmarkt',
                        url: 'https://www.fitnessfirst.de/news/kinderschwimmen-1635593849',
                        calendarUrl: null,
                        is_cancelled: false,
                        is_changed: false
                    };

                    if (Array.isArray(classes)) {
                        response.data.classes[key] = {
                            before_noon: [
                                event
                            ]
                        };
                    } else {
                        classes.before_noon = classes.before_noon || [];
                        classes.before_noon.push(event);
                    }
                }
                if (key.split('_', 2)[1] === 'do') {
                    const event = {
                        id: `kinderschwimmen-${key}`,
                        title: 'Kinderschwimmen',
                        time: {
                            from: '15:00:00',
                            to: '16:30:00'
                        },
                        category: 'Aqua',
                        categoryIcon: 'https://www.fitnessfirst.de/sites/g/files/tbchtk201/files/2020-10/fitness-first-kurse-special.png',
                        level: 'Alle',
                        club: 'Berlin - Gendarmenmarkt',
                        url: 'https://www.fitnessfirst.de/news/kinderschwimmen-1635593849',
                        calendarUrl: null,
                        is_cancelled: false,
                        is_changed: false
                    };

                    if (Array.isArray(classes)) {
                        response.data.classes[key] = {
                            before_noon: [
                                event
                            ]
                        };
                    } else {
                        classes.before_noon = classes.before_noon || [];
                        classes.before_noon.push(event);
                    }
                }
            });
        }

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
