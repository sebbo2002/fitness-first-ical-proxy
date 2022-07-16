export interface RequestParams {
    club_id?: string | number[] | string[];
    category_id?: string | number[] | string[];
    class_id?: string | number[];
    daytime_id?: string | string[];
}

export interface Response {
    data: ResponseData;
}

export interface ResponseData {
    classes: ResponseClasses;
}

export interface ResponseClasses {
    [key: string]: [] | ResponseDay;
}

export interface ResponseDay {
    [key: string]: ResponseCourse[];
}

export interface ResponseCourse {
    id: string;
    title: string;
    time: ResponseCourseTime;
    category: string;
    level: string;
    club: string;
    url: string | null;
    is_cancelled: boolean;
    is_changed: boolean;
}

export interface ResponseCourseTime {
    from: string;
    to: string;
}

