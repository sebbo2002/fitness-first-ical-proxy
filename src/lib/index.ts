import {
    type RequestParams,
    type ResponseClasses,
    type ResponseCourse,
    type ResponseData
} from './types.js';
import type { ICalCalendar } from 'ical-generator';
import ical from 'ical-generator';

export default class FitnessFirstIcalProxy {
    static async request(params: RequestParams): Promise<ICalCalendar> {
        const courses = await this.getCourses(params);
        return this.createCalendar(courses);
    }

    static async getCourses(params: RequestParams): Promise<ResponseClasses> {
        const url = 'https://www.fitnessfirst.de/magicline/api/class-shedule/' +
            this.paramToString(params.club_id) + '/' +
            this.paramToString(params.category_id) + '/' +
            this.paramToString(params.class_id) + '/' +
            this.paramToString(params.daytime_id);

        const res = await fetch(url);
        const response = await res.json() as ResponseData;

        // Kinderschwimmen @ Gendarmenmarkt
        if (params.club_id === '96' && (params.category_id === 'aqua' || !params.category_id)) {
            Object.entries(response.classes).forEach(([key, classes]) => {
                if (key.split('_', 2)[1] === 'sa') {
                    const event = {
                        id: `kinderschwimmen-${key}`,
                        title: 'Kinderschwimmen',
                        time: {
                            from: '09:00:00',
                            to: '12:15:00'
                        },
                        category: 'Aqua',
                        club: 'Berlin - Gendarmenmarkt',
                        url: 'https://www.fitnessfirst.de/news/kinderschwimmen-1635593849'
                    };

                    if (Array.isArray(classes)) {
                        response.classes[key] = {
                            before_noon: [
                                event
                            ]
                        };
                    } else {
                        classes.before_noon = classes.before_noon || [];
                        classes.before_noon.push(event);
                    }
                }
                if (key.split('_', 2)[1] === 'th') {
                    const event = {
                        id: `kinderschwimmen-${key}`,
                        title: 'Kinderschwimmen',
                        time: {
                            from: '15:00:00',
                            to: '17:15:00'
                        },
                        category: 'Aqua',
                        club: 'Berlin - Gendarmenmarkt',
                        url: 'https://www.fitnessfirst.de/news/kinderschwimmen-1635593849'
                    };

                    if (Array.isArray(classes)) {
                        response.classes[key] = {
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

        return response.classes;
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
                courses.forEach((course: ResponseCourse) => {
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
        if(typeof value === 'undefined' || value.length === 0) {
            return 'all';
        }

        return value
            .map(v => v.toString())
            .join('-');
    }
}
