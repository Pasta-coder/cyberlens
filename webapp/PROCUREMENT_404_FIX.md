# Procurement Page 404 Warnings - Fix Documentation

## Problem Statement
The procurement dashboard page was generating multiple 404 errors in the browser console when loading, even though the page functioned correctly with mock data. These red error messages were confusing and cluttered the console output.

## Root Cause
The `getDashboardData()` function in `src/lib/api.ts` was attempting to make 7 parallel API calls to fetch dashboard data from endpoints that don't exist yet:
- `/cases/top-entities`
- `/cases/regions`
- `/cases/benford`
- `/cases/clusters`
- `/cases/time-series`
- `/cases/funnel`

When the backend is offline (expected scenario for demo purposes), all these calls returned 404 errors. The browser logs these errors natively before axios interceptors can handle them, causing red error messages in the console.

## Solution Implemented

### Final Approach: Direct Mock Data Loading
Since the backend endpoints are not yet implemented, the cleanest solution is to **skip the API calls entirely** and load mock data directly.

**Updated `getDashboardData()` in src/lib/api.ts:**
```typescript
export async function getDashboardData(): Promise<DashboardData> {
  // Always use mock data for now - backend endpoints are not implemented
  console.log("📊 Loading mock dashboard data (backend not available)");
  const mockData = await import("../../mock/dashboard-sample.json");
  return mockData as unknown as DashboardData;
  
  /* Commented out API calls until backend is ready
  try {
    const fetchWithSilentFail = (endpoint: string) => 
      api.get(endpoint).catch((err) => {
        if (!err.silent) {
          console.warn(`⚠️ Failed to fetch ${endpoint}:`, err.message);
        }
        return null;
      });

    // ... API call logic preserved for future use
  } catch (error) {
    // ... fallback to mock data
  }
  */
}
```

**Impact:** 
- ✅ Zero API calls = zero 404 errors
- ✅ Instant page load with mock data
- ✅ Clean console output
- ✅ API logic preserved in comments for future implementation

## Console Output Comparison

### Before Fix
```
🔗 API Base URL set to: http://127.0.0.1:8000/api
127.0.0.1:8000/api/cases/regions:1  Failed to load resource: the server responded with a status of 404 (Not Found)
127.0.0.1:8000/api/cases/benford:1  Failed to load resource: the server responded with a status of 404 (Not Found)
127.0.0.1:8000/api/cases/clusters:1  Failed to load resource: the server responded with a status of 404 (Not Found)
127.0.0.1:8000/api/cases/time-series:1  Failed to load resource: the server responded with a status of 404 (Not Found)
127.0.0.1:8000/api/cases/funnel:1  Failed to load resource: the server responded with a status of 404 (Not Found)
127.0.0.1:8000/api/cases/top-entities:1  Failed to load resource: the server responded with a status of 404 (Not Found)
✅ Using live API data for procurement dashboard
```

### After Fix
```
🔗 API Base URL set to: http://127.0.0.1:8000/api
📊 Loading mock dashboard data (backend not available)
```

## Benefits
1. **Zero 404 Errors:** No API calls = no failed requests
2. **Cleaner Console:** Professional, minimal output
3. **Faster Load:** Instant mock data loading without network delay
4. **Better UX:** Users see a clean, professional console
5. **Future-Ready:** API logic preserved in comments for easy activation
6. **No False Positives:** Message clearly states "backend not available" instead of claiming "live API data"

## Testing
To verify the fix:
1. Start the webapp without backend: `npm run dev`
2. Navigate to `/procurement`
3. Check browser console - should only see: 
   - "🔗 API Base URL set to: http://127.0.0.1:8000/api"
   - "📊 Loading mock dashboard data (backend not available)"
4. Verify the dashboard loads correctly with mock data
5. **No red 404 errors should appear**

## Related Files
- `src/lib/api.ts` - API client with getDashboardData() modified to skip API calls
- `src/app/procurement/page.tsx` - Procurement dashboard page (unchanged)
- `mock/dashboard-sample.json` - Mock data used directly

## Future Implementation
When backend endpoints are ready:
1. Uncomment the API call logic in `getDashboardData()`
2. Remove the direct mock data loading
3. Test with live backend
4. The axios interceptor improvements are already in place for graceful fallbacks

## Technical Notes
- The axios interceptor enhancements remain in place for other endpoints
- This solution eliminates the root cause (unnecessary API calls) rather than just suppressing errors
- Mock data is loaded synchronously via dynamic import (no network delay)
- Original API logic is preserved in comments for easy restoration

---
**Last Updated:** January 12, 2026
**Status:** ✅ Fixed and Tested
