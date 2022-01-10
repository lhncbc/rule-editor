import { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { SimpleStyle } from '../rule-editor.service';
import { HttpClient } from '@angular/common/http';
import * as ɵngcc0 from '@angular/core';
export declare class QueryObservationComponent implements OnInit, AfterViewInit, OnDestroy {
    private http;
    queryUrl: string;
    variable: any;
    index: any;
    lhcStyle: SimpleStyle;
    autoCompleteElement: any;
    autoComplete: any;
    codes: Array<string>;
    timeInterval: number;
    timeIntervalUnit: string;
    expression: string;
    constructor(http: HttpClient);
    ngOnInit(): void;
    /**
     * After the autocomplete is ready to be interacted with fetch the name for
     * any codes already in the query search.
     */
    ngAfterViewInit(): void;
    /**
     * Angular lifecycle hook
     */
    ngOnDestroy(): void;
    /**
     * On changes update the expression and preview
     */
    onChange(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<QueryObservationComponent, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<QueryObservationComponent, "lhc-query-observation", never, { "lhcStyle": "lhcStyle"; "variable": "variable"; "index": "index"; }, {}, never, never>;
}

//# sourceMappingURL=query-observation.component.d.ts.map