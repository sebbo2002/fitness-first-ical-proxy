export interface RequestParams {
    club_id?: string | number[] | string[];
    category_id?: string | number[] | string[];
    class_id?: string | number[];
    daytime_id?: string | string[];
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
    club: string;
    url: string | null;
}

export interface ResponseCourseTime {
    from: string;
    to: string;
}

