import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabDetailComponent } from './tab-detail';

describe('TabDetailComponent', () => {
  let component: TabDetailComponent;
  let fixture: ComponentFixture<TabDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
