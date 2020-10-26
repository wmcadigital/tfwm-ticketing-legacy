# Release Notes

## Ticketing v2.13.29

- new: mobility credits directive
- fix: grid refresh when load more results
- update: device debug info

## Ticketing v2.12.27

- bugfix: fix image to to use lowercase file names as cdn does not like uppercase

## Ticketing v2.12.26

- update: fix release staging url

## Ticketing v2.12.25

- new: item directive
- new: add refresher directive
- new: add device detector debugger
- update: implement new api in ticket search
- update: where to buy in related products item
- update: where to buy in ticket details
- update: hide cyan top border
- update: remove individual shared partials
- update: move the loading spinner to the main index
- update: button cta styling
- update: new staging api
- bugfix: remove comma before gpay in where to buy
- bugfix: sort filter style on swift finder

## Ticketing v2.9.15

- New: Price directive for ticket search & related tickets - Shared directive and add “From” if Swift price is lower
- New: Price directive for ticket page - Shared directive for sidebar and mobile view
- New: shared search directive - All ticket finders share the same search but can hide pass options depending on the ticket finder
- New: Added Google Pay to “Where to buy” in the search results
- New: If the device is Android any GPay tickets will have a new button saying “Buy on Google Pay” (it will also hide the “buy from” information and Swift on Mobile information)
- New Added popup modal for NFC explanation only on Android
- New: Added new popup for Swift PAYG within ticket search results
- New: Added a ticket counter for tickets you can buy on Swift PAYG
- New: Added rollover help text to google pay on the search results page
- Update: Show stagecoach and swift go passes on all finders
- Update: Remove breadcrumb from Oneapp finder
- Update: Add underline to item titles
- Update: Added standard and discounted rates if available
- Update: Direct Debit tickets are shown last in the search results
- Update: Display no filters for Swift PAYG as non-available
- Update: Updated Swift PAYG tickets so it only filters matched results rather than all products
- Update: Rail: Only show "To" and Via options if "From" station is selected (Hide search button until required fields are entered)
- Fix: Fixed an issue with the modals on mobile
- Fix: Search with train - API was updated to a more compliant format. Ticket finder has been updated so it works correctly.
- Fix: Swift & Oneapp build process
- Fix: Disabled buttons on initial swift search

## Ticketing v2.0.3

- Changed build so it builds all assets at once

## Ticketing v2.0.2

- Added new dev build scripts for Swift & Oneapp

## Ticketing v2.0.1

- Updated build directories. Fixed issue building service apis

## Ticketing v2.0.0

- Styling Amends for OneApp
- Integrate Swift search into one Repo

## NWM Ticketing v1.0.13

- Bugfix: Fix Modal pop-ups on mobile view for ticket details page

## NWM Ticketing v1.0.12

- Update item & related product so "credit" and "a day" does not show for Swift go ticket 811

## NWM Ticketing v1.0.11

- Update sidebar & details so "credit" and "a day" does not show for Swift go ticket 811
- Update details page to use the same logic for "when you buy online"

## NWM Ticketing v1.0.9

- Update build process for the Swift Go pass as they have different names on staging and live endpoints

## NWM Ticketing v1.0.8

- Update build process
- New feature - Swift Go pass dropdown

## NWM Ticketing v1.0.6

- Update API endpoints

## NWM Ticketing v1.0.5

- Move modals to sidebar as it broke the button if no "where to buy" block
- if ticket can be brought on DD and Swift make sure the button states "Buy on Direct Debit"
- Remove hide logic from "where to buy" block
- Update api links and copy
- Added logic so that it shows the word 'decreases' or 'increases' depending on future ticket price

## NWM Ticketing v1.0.0

Initial Release
