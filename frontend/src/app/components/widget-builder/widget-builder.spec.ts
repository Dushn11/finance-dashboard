import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetBuilder } from './widget-builder';

describe('WidgetBuilder', () => {
  let component: WidgetBuilder;
  let fixture: ComponentFixture<WidgetBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
