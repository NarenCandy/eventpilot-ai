import React, { useState, useEffect } from 'react';
import { Store, Check, AlertCircle, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { compareVendorQuotes } from '../services/api';

const DEFAULT_SAMPLE_VENDORS = {
  venue: [
    {
      id: 'v_venue_1',
      name: 'Sunset Glasshouse Conservatory',
      price: 8500,
      capacity: 140,
      inclusions: ['tables & chairs', 'setup & teardown', 'restrooms', 'climate control', 'curfew flexibility'],
      extraCharges: [
        { name: 'Cleaning deposit', amount: 450 },
        { name: 'Bridal suite preparation', amount: 300 }
      ]
    },
    {
      id: 'v_venue_2',
      name: 'Historic Heritage Courtyard',
      price: 6800,
      capacity: 110,
      inclusions: ['tables & chairs', 'restrooms', 'outdoor lawn arbor'],
      extraCharges: [
        { name: 'Mandatory generator rental', amount: 650 },
        { name: 'Post-event teardown fee', amount: 500 }
      ]
    },
    {
      id: 'v_venue_3',
      name: 'Skyline Grand Loft',
      price: 11200,
      capacity: 200,
      inclusions: ['tables & chairs', 'setup & teardown', 'restrooms', 'climate control', 'curfew flexibility', 'in-house architectural lighting'],
      extraCharges: []
    }
  ],
  catering: [
    {
      id: 'v_cat_1',
      name: 'Artisan Feast Culinary & Co.',
      price: 8200,
      capacity: 150,
      inclusions: ['waitstaff', 'barware/tableware', 'dietary accommodations', 'cake cutting fee waiver', 'cleanup'],
      extraCharges: [{ name: 'Chef station surcharge', amount: 400 }]
    },
    {
      id: 'v_cat_2',
      name: 'Boutique Farmhouse Catering',
      price: 6900,
      capacity: 100,
      inclusions: ['waitstaff', 'cleanup', 'farm-to-table tasting'],
      extraCharges: [
        { name: 'Rental glassware & plates', amount: 950 },
        { name: 'Special allergen meal plating', amount: 350 }
      ]
    }
  ],
  photography: [
    {
      id: 'v_photo_1',
      name: 'Luminescent Visuals Studio',
      price: 3600,
      capacity: 0,
      inclusions: ['high-res digital gallery', 'second shooter', 'print rights', 'timeline coordination'],
      extraCharges: []
    },
    {
      id: 'v_photo_2',
      name: 'Kinetic Frame Media',
      price: 2800,
      capacity: 0,
      inclusions: ['high-res digital gallery', 'print rights'],
      extraCharges: [{ name: 'Second photographer add-on', amount: 600 }]
    }
  ]
};

export default function VendorComparison({ currentPlan }) {
  const [selectedCategory, setSelectedCategory] = useState('venue');
  const [vendorList, setVendorList] = useState(DEFAULT_SAMPLE_VENDORS.venue);
  const [comparisonResult, setComparisonResult] = useState(null);

  const headcount = currentPlan?.eventInfo?.headcount || 120;
  const categoryBudget = currentPlan?.budget?.categories?.[selectedCategory]?.allocated || 9000;

  useEffect(() => {
    let isCancelled = false;
    const list = DEFAULT_SAMPLE_VENDORS[selectedCategory] || [];
    setVendorList(list);

    compareVendorQuotes(selectedCategory, list, {
      headcount,
      budgetAllocated: categoryBudget
    }).then(res => {
      if (!isCancelled) {
        setComparisonResult(res);
      }
    }).catch(err => {
      console.error('Vendor comparison failed:', err);
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, headcount, categoryBudget]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            Structured Vendor Quote Comparison & Gap Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Compare vendor quotes side-by-side with automatic gap detection for missing inclusions and hidden fees.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2">
          {['venue', 'catering', 'photography'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Unverified Quote Label Notice */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Transparency Notice:</span> All vendor prices, inclusions, and capacity limits shown below are <strong>unverified quotes (user-supplied or simulated estimates)</strong>. No live vendor contract or guaranteed automated availability is claimed.
        </div>
      </div>

      {/* Cards Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(comparisonResult?.vendors || vendorList).map((vendor) => {
          const isLowest = vendor.isLowestCost;
          const isMostInclusive = vendor.isMostInclusive;
          const totalCost = vendor.totalEstimatedCost || vendor.price;

          return (
            <div
              key={vendor.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all relative ${
                isLowest
                  ? 'bg-slate-950 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div>
                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {isLowest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Lowest Cost
                    </span>
                  )}
                  {isMostInclusive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Inclusive
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white mb-1">
                  {vendor.name}
                </h4>

                {/* Price Display */}
                <div className="mt-2 mb-3">
                  <div className="text-2xl font-bold text-white font-mono">
                    ${totalCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Base: ${vendor.price?.toLocaleString()}
                    {vendor.extraCharges?.length > 0 && ` + $${vendor.extraFeesTotal?.toLocaleString()} extras`}
                  </div>
                  {vendor.costPerGuest && (
                    <div className="text-[11px] text-indigo-400 font-medium">
                      ~${vendor.costPerGuest} / guest (based on {headcount} target)
                    </div>
                  )}
                </div>

                {/* Capacity */}
                {vendor.capacity > 0 && (
                  <div className="text-xs text-slate-300 mb-3 pb-3 border-b border-slate-800">
                    <span className="text-slate-500">Max Capacity:</span>{' '}
                    <span className="font-semibold text-white">{vendor.capacity} guests</span>
                  </div>
                )}

                {/* Inclusions */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-semibold text-slate-300">Included Services:</div>
                  <div className="space-y-1">
                    {vendor.inclusions.map((inc, i) => (
                      <div key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Fees */}
                {vendor.extraCharges?.length > 0 && (
                  <div className="space-y-1.5 mb-4 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400">Required Extra Charges:</div>
                    {vendor.extraCharges.map((fee, i) => (
                      <div key={i} className="text-[11px] text-slate-400 flex justify-between">
                        <span>{fee.name}</span>
                        <span className="text-slate-300 font-mono">+${fee.amount}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gap & Advantage Flags */}
                {vendor.gaps?.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {vendor.gaps.map((gap, i) => (
                      <div key={i} className="text-[11px] text-rose-300 bg-rose-950/30 border border-rose-900/30 p-2 rounded-lg flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strict Verification Footer */}
              <div className="pt-3 border-t border-slate-800 mt-2">
                <span className="text-[10px] text-slate-500 italic block">
                  {vendor.verificationNotice || 'Unverified quote — user-supplied estimate'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
