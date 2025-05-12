export interface RequestParams {
    category_id?: number[] | string | string[];
    class_id?: number[] | string;
    club_id?: number[] | string | string[];
    daytime_id?: string | string[];
}

export interface ResponseClasses {
    [key: string]: [] | ResponseDay;
}

export interface ResponseCourse {
    category: string;
    club: string;
    id: string;
    time: ResponseCourseTime;
    title: string;
    url: null | string;
}

export interface ResponseCourseTime {
    from: string;
    to: string;
}

export interface ResponseData {
    classes: ResponseClasses;
}

export interface ResponseDay {
    [key: string]: ResponseCourse[];
}
