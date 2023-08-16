import { Component, DebugElement, ViewChild } from "@angular/core";
import {
    ComponentFixture,
    ComponentFixtureAutoDetect,
    TestBed,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { LazyLoadImagesDirective } from "./ngx-lazy-load-images.directive";

@Component({
    template: `<h1>{{ "Lazy Loading your images" }}</h1>
        <p>{{ "Scroll down to play" }}</p>
        <div id="page-wrap" [lazy-load-images]="200">
            <img
                id="testImgEl"
                [attr.data-src]="'./assets/fake-image.png'"
                height="500px"
                width="100%"
            />
        </div>`,
})
class TestLazyLoadImagesComponent {
    @ViewChild(LazyLoadImagesDirective, { static: true })
    public lazyloadMediasDirective!: LazyLoadImagesDirective;
}

let component: TestLazyLoadImagesComponent;
let directive: LazyLoadImagesDirective;
let fixture: ComponentFixture<TestLazyLoadImagesComponent>;
let imageElement: DebugElement;

const setupModule = (providers: unknown[] = []) => {
    TestBed.configureTestingModule({
        declarations: [TestLazyLoadImagesComponent, LazyLoadImagesDirective],
        providers: [
            { provide: ComponentFixtureAutoDetect, useValue: true },
            ...providers,
        ],
        teardown: { destroyAfterEach: false },
    });

    fixture = TestBed.createComponent(TestLazyLoadImagesComponent);
    component = fixture.componentInstance;
    imageElement = fixture.debugElement.query(By.css("#testImgEl"));
    fixture.detectChanges();

    directive = (
        component as unknown as {
            lazyloadMediasDirective: LazyLoadImagesDirective;
        }
    ).lazyloadMediasDirective;
};

describe("LazyLoadImagesDirective", () => {
    beforeEach(() => {
        // IntersectionObserver isn't available in test environment
        const mockIntersectionObserver = jest.fn();
        mockIntersectionObserver.mockReturnValue({
            observe: () => undefined,
            unobserve: () => undefined,
            disconnect: () => undefined,
        });
        window.IntersectionObserver = mockIntersectionObserver;
    });

    describe("Given a component that uses this directive", () => {
        it("should create an instance", () => {
            setupModule();
            expect(component).toBeTruthy();
            expect(directive).toBeTruthy();
            expect(imageElement).toBeTruthy();
        });
    });

    describe("ngOnInit()", () => {
            it("should call init() method", () => {
                const spy = jest.spyOn(
                    directive as unknown as { init: () => void },
                    "init",
                );
                // Execute
                directive.ngOnInit();

                // Assert
                expect(spy).toHaveBeenCalled();
            });
    });

    describe("onIntersectionChange()", () => {
        describe("When an image with a single source appears", () => {
            it("should load the related image", () => {
                // Setup
                setupModule();
                const spy = jest.spyOn(directive["renderer"], "setAttribute");
                // Execute
                directive["onIntersectionChange"]({
                    isIntersecting: true,
                    target: {
                        nodeName: "IMG",
                        dataset: { src: "foo" },
                        setAttribute: () => {},
                        removeAttribute: () => {},
                    },
                } as unknown as IntersectionObserverEntry);
                // Assert
                expect(spy).toHaveBeenCalled();
            });
        });

        describe("When an image with a source set appears", () => {
            it("should load the related image", () => {
                // Setup
                setupModule();
                const spy = jest.spyOn(directive["renderer"], "setAttribute");
                // Execute
                directive["onIntersectionChange"]({
                    isIntersecting: true,
                    target: {
                        nodeName: "IMG",
                        dataset: { srcset: "foo bar baz" },
                        setAttribute: () => {},
                        removeAttribute: () => {},
                    },
                } as unknown as IntersectionObserverEntry);
                // Assert
                expect(spy).toHaveBeenCalled();
            });
        });
    });
});
