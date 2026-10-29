# carribu_super_admin

## Vehicle GPS trackers (super admin only)

Open **Schools**, select the school, and find **Vehicles** under
**School Resource Management**. Choose **Link tracker** and enter the exact
Traccar **Identifier** (normally the IMEI). **Change tracker** replaces the
assignment; **Unlink tracker** removes it after confirmation.

The backend permits only `super_admin` accounts to manage tracker assignments
through `PUT /api/super-admin/schools/{schoolId}/vehicles/{vehicleId}/tracker`.
The request contains `{"trackerUniqueId":"device-identifier"}`, or
`{"trackerUniqueId":null}` to unlink. Each tracker can be assigned to only one
vehicle across all schools. The vehicle must belong to the school in the URL.
Existing assignments are preserved; no database migration is needed.

School admins see tracker assignments read-only. Their vehicle create/update
APIs reject tracker assignment changes. Linking does not activate a vehicle
or start a trip: saving locations still requires an active vehicle, an
in-progress trip, and a fix dated after the trip started.