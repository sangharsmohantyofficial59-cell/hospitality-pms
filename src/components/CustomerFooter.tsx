/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Hotel, Heart } from "lucide-react";
import { hotelConfig } from "../config/hotelConfig";

export default function CustomerFooter() {
  return (
    <footer id="customer-footer-comp" className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Col 1 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-sans font-bold text-lg">
            <Hotel className="w-5 h-5 text-amber-500" />
            <span className="text-white">{hotelConfig.info.name}</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            {hotelConfig.info.shortDescription} {hotelConfig.info.longDescription.substring(0, 150)}...
          </p>
        </div>
 
        {/* Col 2 */}
        <div className="flex flex-col gap-3">
          <h4 className="font-sans font-semibold text-white text-sm">Resort Policies</h4>
          <ul className="flex flex-col gap-1.5 leading-relaxed text-slate-400">
            <li>Standard check-in hours: {hotelConfig.policies.checkInTime}</li>
            <li>Standard check-out hours: {hotelConfig.policies.checkOutTime}</li>
            <li>{hotelConfig.policies.cancellation}</li>
            <li>{hotelConfig.policies.child}</li>
          </ul>
        </div>
 
        {/* Col 3 */}
        <div className="flex flex-col gap-3">
          <h4 className="font-sans font-semibold text-white text-sm">Heritage Address</h4>
          <p className="leading-relaxed text-slate-400">
            {hotelConfig.contact.address}<br />
            Phone: {hotelConfig.contact.phone}<br />
            Email: {hotelConfig.contact.email}
          </p>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono">
        <span>© 2026 {hotelConfig.info.name}. All Rights Reserved.</span>
        <span className="flex items-center gap-1">
          Made for guests with <Heart className="w-3.5 h-3.5 text-amber-500 fill-current" />
        </span>
      </div>
    </footer>
  );
}
