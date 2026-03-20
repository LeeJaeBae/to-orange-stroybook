'use client';

import { useState, useMemo } from "react";
import { Building2, Users, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { facilities, regions, type Region } from "@/data/facilities";

interface FacilityPickerProps {
  familyMembers: any[];
  selectedFamilyMemberId: string | null;
  onSelectFamilyMember: (id: string) => void;
  onSelectFacility: (name: string, address: string) => void;
}

type PickerTab = 'recipient' | 'prison' | 'detention';

export function FacilityPicker({
  familyMembers,
  selectedFamilyMemberId,
  onSelectFamilyMember,
  onSelectFacility,
}: FacilityPickerProps) {
  const [tab, setTab] = useState<PickerTab>('recipient');
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFamilyMembers = useMemo(() => {
    if (!normalizedQuery) return familyMembers;

    return familyMembers.filter((member: any) =>
      [member.name, member.facility, member.facilityAddress]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [familyMembers, normalizedQuery]);

  const filteredFacilities = useMemo(() => {
    const type = tab === 'prison' ? '교도소' : '구치소';
    return facilities.filter(f =>
      f.type === type &&
      (selectedRegion === '' || f.region === selectedRegion) &&
      (
        normalizedQuery === '' ||
        f.name.toLowerCase().includes(normalizedQuery) ||
        f.address.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [normalizedQuery, tab, selectedRegion]);

  const handleFacilitySelect = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    const facility = facilities.find(f => f.id === facilityId);
    if (facility) {
      onSelectFacility(facility.navigationLabel || facility.name, facility.navigationAddress || facility.address);
    }
  };

  const tabs: { key: PickerTab; label: string; icon: typeof Building2 }[] = [
    { key: 'recipient', label: '수신자', icon: Users },
    { key: 'prison', label: '교도소', icon: Building2 },
    { key: 'detention', label: '구치소', icon: Building2 },
  ];

  return (
    <div className="space-y-3">
      {/* 탭 */}
      <div className="flex gap-1.5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setSelectedFacilityId('');
              setSearchQuery('');
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              tab === key
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-foreground/70 hover:bg-gray-200"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tab === 'recipient' ? '수신자나 시설명 검색' : '시설명 또는 주소 검색'}
          className="h-9 pl-8 text-sm"
        />
      </div>

      {/* 수신자 탭 */}
      {tab === 'recipient' && (
        <div className="border border-border/40 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
          {filteredFamilyMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3">등록된 수신자가 없습니다</p>
          ) : (
            filteredFamilyMembers.map((member: any) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelectFamilyMember(member.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-border/20 last:border-b-0",
                  selectedFamilyMemberId === member.id && "bg-orange-50"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-medium">
                  {member.name?.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium">{member.name}</p>
                  {member.facility && (
                    <p className="text-xs text-muted-foreground truncate">{member.facility}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* 교도소/구치소 탭 */}
      {(tab === 'prison' || tab === 'detention') && (
        <div className="space-y-2">
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => { setSelectedRegion(e.target.value as Region | ''); setSelectedFacilityId(''); }}
              className="w-full appearance-none bg-gray-50 border border-border/60 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">전체 지역</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="border border-border/40 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
            {filteredFacilities.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">조건에 맞는 시설이 없습니다</p>
            ) : (
              filteredFacilities.map((facility) => (
                <button
                  key={facility.id}
                  type="button"
                  onClick={() => handleFacilitySelect(facility.id)}
                  className={cn(
                    "w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-border/20 last:border-b-0",
                    selectedFacilityId === facility.id && "bg-orange-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{facility.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">
                        {facility.navigationAddress || facility.address}
                      </p>
                    </div>
                    <span className="shrink-0 text-size-10 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {facility.region}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {selectedFacilityId && (() => {
            const f = facilities.find(fa => fa.id === selectedFacilityId);
            return f ? (
              <div className="p-2.5 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-700">{f.name}</p>
                <p className="text-xs text-orange-600/70 mt-0.5">{f.navigationAddress || f.address}</p>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}
