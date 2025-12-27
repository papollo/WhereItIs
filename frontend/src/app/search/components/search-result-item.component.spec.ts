import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { SearchResultItemComponent } from './search-result-item.component';

describe('SearchResultItemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultItemComponent],
    }).compileComponents();
  });

  it('emits open when clicked', () => {
    const fixture = TestBed.createComponent(SearchResultItemComponent);
    const component = fixture.componentInstance;
    component.item = {
      itemId: 'i-1',
      itemName: 'Keys',
      furnitureId: 'f-1',
      furnitureName: 'Drawer',
      roomId: 'r-1',
      roomName: 'Hall',
    };
    const openSpy = spyOn(component.open, 'emit');

    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', {});

    expect(openSpy).toHaveBeenCalledWith(component.item);
  });
});
