import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { RoomFormComponent } from './room-form.component';

describe('RoomFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFormComponent],
    }).compileComponents();
  });

  it('applies input value to the form', () => {
    const fixture = TestBed.createComponent(RoomFormComponent);
    const component = fixture.componentInstance;

    component.value = { name: 'Kitchen', color: '#123456' };
    fixture.detectChanges();

    expect(component.form.controls.name.value).toBe('Kitchen');
    expect(component.form.controls.color.value).toBe('#123456');
  });

  it('emits valueChange on form updates', () => {
    const fixture = TestBed.createComponent(RoomFormComponent);
    const component = fixture.componentInstance;
    const emitSpy = spyOn(component.valueChange, 'emit');

    fixture.detectChanges();
    component.form.controls.name.setValue('Office');

    expect(emitSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'Office', color: component.form.controls.color.value })
    );
  });

  it('updates color when selecting from palette', () => {
    const fixture = TestBed.createComponent(RoomFormComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    component.onColorSelect('#abcdef');

    expect(component.form.controls.color.value).toBe('#abcdef');
  });

  it('updates color input on typing', () => {
    const fixture = TestBed.createComponent(RoomFormComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const colorInput = fixture.debugElement.queryAll(By.css('input'))[1];
    colorInput.nativeElement.value = '#112233';
    colorInput.triggerEventHandler('input', { target: colorInput.nativeElement });

    expect(component.form.controls.color.value).toBe('#112233');
  });
});
