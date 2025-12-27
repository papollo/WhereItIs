import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { SearchFormComponent } from './search-form.component';

describe('SearchFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent],
    }).compileComponents();
  });

  it('emits update on input', () => {
    const fixture = TestBed.createComponent(SearchFormComponent);
    const component = fixture.componentInstance;
    const updateSpy = spyOn(component.update, 'emit');

    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = 'Keys';
    input.triggerEventHandler('input', { target: input.nativeElement });

    expect(updateSpy).toHaveBeenCalledWith('Keys');
  });

  it('submits only for non-empty queries', () => {
    const fixture = TestBed.createComponent(SearchFormComponent);
    const component = fixture.componentInstance;
    const submitSpy = spyOn(component.submitQuery, 'emit');

    component.query = ' ';
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', { preventDefault: () => {} });
    expect(submitSpy).not.toHaveBeenCalled();

    component.query = 'wallet';
    fixture.detectChanges();
    form.triggerEventHandler('submit', { preventDefault: () => {} });
    expect(submitSpy).toHaveBeenCalledWith('wallet');
  });
});
