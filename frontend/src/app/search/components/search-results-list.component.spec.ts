import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { SearchResultsListComponent } from './search-results-list.component';

describe('SearchResultsListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsListComponent],
    }).compileComponents();
  });

  it('emits open when result item is clicked', () => {
    const fixture = TestBed.createComponent(SearchResultsListComponent);
    const component = fixture.componentInstance;
    component.items = [
      {
        itemId: 'i-1',
        itemName: 'Keys',
        furnitureId: 'f-1',
        furnitureName: 'Drawer',
        roomId: 'r-1',
        roomName: 'Hall',
      },
      {
        itemId: 'i-2',
        itemName: 'Wallet',
        furnitureId: 'f-2',
        furnitureName: 'Shelf',
        roomId: 'r-2',
        roomName: 'Office',
      },
    ];

    const openSpy = spyOn(component.open, 'emit');

    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button.search-result'));
    buttons[0].triggerEventHandler('click', {});

    expect(openSpy).toHaveBeenCalledWith(component.items[0]);
  });
});
