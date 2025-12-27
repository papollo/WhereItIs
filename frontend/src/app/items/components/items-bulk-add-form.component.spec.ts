import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { ItemsBulkAddFormComponent } from './items-bulk-add-form.component';

describe('ItemsBulkAddFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemsBulkAddFormComponent],
    }).compileComponents();
  });

  it('emits add, remove, and update actions', () => {
    const fixture = TestBed.createComponent(ItemsBulkAddFormComponent);
    const component = fixture.componentInstance;
    component.drafts = [
      { id: 'd1', name: 'Item 1' },
      { id: 'd2', name: 'Item 2' },
    ];

    const addSpy = spyOn(component.add, 'emit');
    const removeSpy = spyOn(component.remove, 'emit');
    const updateSpy = spyOn(component.update, 'emit');

    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('header button'));
    addButton.triggerEventHandler('click', {});
    expect(addSpy).toHaveBeenCalled();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    inputs[0].nativeElement.value = 'Updated';
    inputs[0].triggerEventHandler('input', { target: inputs[0].nativeElement });
    expect(updateSpy).toHaveBeenCalledWith({ id: 'd1', name: 'Updated' });

    const removeButtons = fixture.debugElement.queryAll(By.css('.items-form__row button'));
    removeButtons[0].triggerEventHandler('click', {});
    expect(removeSpy).toHaveBeenCalledWith('d1');
  });

  it('disables buttons when saving', () => {
    const fixture = TestBed.createComponent(ItemsBulkAddFormComponent);
    const component = fixture.componentInstance;
    component.drafts = [{ id: 'd1', name: 'Item 1' }];
    component.saving = true;

    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('header button')).nativeElement as HTMLButtonElement;
    const removeButton = fixture.debugElement.query(By.css('.items-form__row button'))
      .nativeElement as HTMLButtonElement;

    expect(addButton.disabled).toBeTrue();
    expect(removeButton.disabled).toBeTrue();
  });
});
