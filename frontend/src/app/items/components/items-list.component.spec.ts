import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ItemsListComponent } from './items-list.component';

describe('ItemsListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemsListComponent, MatIconTestingModule],
    }).compileComponents();
  });

  it('shows loading and empty states', () => {
    const fixture = TestBed.createComponent(ItemsListComponent);
    const component = fixture.componentInstance;
    component.items = [];
    component.isLoading = true;

    fixture.detectChanges();
    const loadingText = fixture.nativeElement.textContent as string;
    expect(loadingText).toContain('Laduje przedmioty...');

    component.isLoading = false;
    fixture.detectChanges();
    const emptyText = fixture.nativeElement.textContent as string;
    expect(emptyText).toContain('Brak przedmiotow.');
  });

  it('emits delete when item row delete is clicked', () => {
    const fixture = TestBed.createComponent(ItemsListComponent);
    const component = fixture.componentInstance;
    component.items = [{ id: 'i-1', name: 'Keys' }];

    const deleteSpy = spyOn(component.delete, 'emit');

    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.item-row__delete'));
    button.triggerEventHandler('click', {});

    expect(deleteSpy).toHaveBeenCalledWith('i-1');
  });
});
