import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check, Users, Info, BookUser, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { 
  facilities, 
  facilityTypes, 
  relationTypes,
  type FacilityType, 
  type Region,
  type RelationType 
} from "@/data/facilities";
import type { FamilyMember } from "@/types/mail";

interface RecipientInfoStepProps {
  selectedFacilityType: FacilityType | null;
  setSelectedFacilityType: (type: FacilityType | null) => void;
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region | null) => void;
  selectedFacilityId: string | null;
  setSelectedFacilityId: (id: string | null) => void;
  recipientName: string;
  setRecipientName: (name: string) => void;
  prisonerNumber: string;
  setPrisonerNumber: (number: string) => void;
  selectedRelation: RelationType | null;
  setSelectedRelation: (relation: RelationType | null) => void;
  customAddress?: string;
  setCustomAddress?: (address: string) => void;
  familyMembers?: FamilyMember[];
  onSelectFromAddressBook?: (member: FamilyMember) => void;
}

export function RecipientInfoStep({
  selectedFacilityType,
  setSelectedFacilityType,
  selectedRegion,
  setSelectedRegion,
  selectedFacilityId,
  setSelectedFacilityId,
  recipientName,
  setRecipientName,
  prisonerNumber,
  setPrisonerNumber,
  selectedRelation,
  setSelectedRelation,
  customAddress = "",
  setCustomAddress,
  familyMembers = [],
  onSelectFromAddressBook,
}: RecipientInfoStepProps) {
  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [showAddressBook, setShowAddressBook] = useState(true);

  // Filter facilities by type and region
  const isGeneralAddress = selectedFacilityType === "일반 주소";
  
  const filteredFacilities = facilities.filter(f => {
    if (!selectedFacilityType || isGeneralAddress) return false;
    const typeMatch = f.type === selectedFacilityType;
    const regionMatch = !selectedRegion || f.region === selectedRegion;
    return typeMatch && regionMatch;
  });

  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  // Step completion status
  const isStep1Complete = selectedFacilityType !== null;
  const isStep2Complete = isGeneralAddress || selectedRegion !== null;
  const isStep3Complete = isGeneralAddress || selectedFacilityId !== null;
  const isStep4Complete = recipientName.trim() !== "" && (isGeneralAddress || prisonerNumber.trim() !== "");
  const isStep5Complete = selectedRelation !== null;

  // Available regions based on facility type
  const availableRegions = [...new Set(
    facilities
      .filter(f => f.type === selectedFacilityType)
      .map(f => f.region)
  )];

  const StepHeader = ({ 
    step, 
    title, 
    isComplete, 
    isExpanded, 
    value,
    onClick 
  }: { 
    step: number; 
    title: string; 
    isComplete: boolean; 
    isExpanded: boolean;
    value?: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl transition-all",
        isExpanded ? "bg-primary/5" : "hover:bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
          isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {isComplete ? <Check className="w-4 h-4" /> : step}
        </div>
        <span className={cn(
          "font-medium",
          isExpanded ? "text-primary" : "text-foreground"
        )}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {value && !isExpanded && (
          <span className="text-sm text-muted-foreground">{value}</span>
        )}
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    </button>
  );

  return (
    <div className="space-y-3">
      {/* 주소록에서 선택 */}
      {familyMembers.length > 0 && (
        <div className="border border-primary/30 rounded-xl overflow-hidden bg-primary/5">
          <button
            onClick={() => setShowAddressBook(!showAddressBook)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <BookUser className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <span className="font-medium text-primary">등록된 주소록에서 선택</span>
                <p className="text-xs text-muted-foreground">기존에 저장된 받는사람 정보를 불러옵니다</p>
              </div>
            </div>
            {showAddressBook ? (
              <ChevronUp className="w-5 h-5 text-primary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary" />
            )}
          </button>
          <AnimatePresence>
            {showAddressBook && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="bg-background rounded-xl border border-border divide-y divide-border max-h-48 overflow-y-auto">
                    {familyMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onSelectFromAddressBook?.(member);
                          setShowAddressBook(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                            member.color
                          )}
                        >
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.relation} · {member.facility}
                          </p>
                          {member.prisonerNumber && (
                            <p className="text-xs text-muted-foreground/70">
                              수용자번호: {member.prisonerNumber}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 새로 입력하기 구분선 */}
      {familyMembers.length > 0 && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">또는 새로 입력</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}
      <div className="border border-border rounded-xl overflow-hidden">
        <StepHeader
          step={1}
          title="시설 유형 선택"
          isComplete={isStep1Complete}
          isExpanded={expandedStep === 1}
          value={selectedFacilityType || undefined}
          onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
        />
        <AnimatePresence>
          {expandedStep === 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0">
                <div className="bg-secondary/30 rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {facilityTypes.map(({ type, emoji }) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedFacilityType(type);
                          setSelectedRegion(null);
                          setSelectedFacilityId(null);
                          setExpandedStep(2);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                          selectedFacilityType === type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 bg-background"
                        )}
                      >
                        <span>{emoji}</span>
                        <span className="font-medium">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 2: 지역 선택 */}
      {selectedFacilityType && selectedFacilityType !== "일반 주소" && (
        <div className="border border-border rounded-xl overflow-hidden">
          <StepHeader
            step={2}
            title="지역 선택"
            isComplete={isStep2Complete}
            isExpanded={expandedStep === 2}
            value={selectedRegion || undefined}
            onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
          />
          <AnimatePresence>
            {expandedStep === 2 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex flex-wrap gap-2">
                      {availableRegions.map((region) => (
                        <button
                          key={region}
                          onClick={() => {
                            setSelectedRegion(region as Region);
                            setSelectedFacilityId(null);
                            setExpandedStep(3);
                          }}
                          className={cn(
                            "px-4 py-2 rounded-lg border transition-all",
                            selectedRegion === region
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50 bg-background"
                          )}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Step 3: 시설 선택 */}
      {isStep2Complete && selectedFacilityType !== "일반 주소" && (
        <div className="border border-border rounded-xl overflow-hidden">
          <StepHeader
            step={3}
            title="시설 선택"
            isComplete={isStep3Complete}
            isExpanded={expandedStep === 3}
            value={selectedFacility?.name}
            onClick={() => setExpandedStep(expandedStep === 3 ? 0 : 3)}
          />
          <AnimatePresence>
            {expandedStep === 3 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <div className="bg-secondary/30 rounded-xl p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {filteredFacilities.map((facility) => (
                        <button
                          key={facility.id}
                          onClick={() => {
                            setSelectedFacilityId(facility.id);
                            setExpandedStep(4);
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all",
                            selectedFacilityId === facility.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 bg-background"
                          )}
                        >
                          <p className="font-medium text-foreground">{facility.name}</p>
                          <p className="text-sm text-muted-foreground">{facility.address}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 일반 주소일 경우 주소 입력 */}
      {selectedFacilityType === "일반 주소" && (
        <div className="border border-border rounded-xl overflow-hidden">
          <StepHeader
            step={2}
            title="주소 입력"
            isComplete={customAddress?.trim() !== ""}
            isExpanded={expandedStep === 2}
            value={customAddress ? customAddress.substring(0, 20) + "..." : undefined}
            onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
          />
          <AnimatePresence>
            {expandedStep === 2 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <Input
                      value={customAddress}
                      onChange={(e) => setCustomAddress?.(e.target.value)}
                      placeholder="주소를 입력하세요"
                      className="w-full focus-visible:ring-0 focus-visible:border-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Step 4: 받는 분 정보 */}
      {(isStep3Complete || (isGeneralAddress && customAddress?.trim())) && (
        <div className="border border-border rounded-xl overflow-hidden">
          <StepHeader
            step={isGeneralAddress ? 3 : 4}
            title="받는 분 정보"
            isComplete={isStep4Complete}
            isExpanded={expandedStep === 4}
            value={recipientName || undefined}
            onClick={() => setExpandedStep(expandedStep === 4 ? 0 : 4)}
          />
          <AnimatePresence>
            {expandedStep === 4 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">받는 분 성함</label>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="예: 홍길동"
                      className="border-primary/30 focus:border-primary focus-visible:ring-0"
                    />
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <label className="text-sm font-medium text-foreground mb-2 block">수용자 번호 (필수)</label>
                    <Input
                      value={prisonerNumber}
                      onChange={(e) => setPrisonerNumber(e.target.value)}
                      placeholder="예: 1234 (모르면 생년월일)"
                      className="bg-background focus-visible:ring-0 focus-visible:border-primary"
                    />
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
                      <Info className="w-3 h-3" />
                      <span>수용자 번호를 정확히 입력해주세요.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Step 5: 받는분과의 관계 */}
      {isStep4Complete && (
        <div className="border border-border rounded-xl overflow-hidden">
          <StepHeader
            step={isGeneralAddress ? 4 : 5}
            title="받는분과의 관계"
            isComplete={isStep5Complete}
            isExpanded={expandedStep === 5}
            value={selectedRelation || undefined}
            onClick={() => setExpandedStep(expandedStep === 5 ? 0 : 5)}
          />
          <AnimatePresence>
            {expandedStep === 5 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">받는분과의 관계</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">나에게 받는분은 어떤 사이인가요?</p>
                  <div className="flex flex-wrap gap-2">
                    {relationTypes.map((relation) => (
                      <button
                        key={relation}
                        onClick={() => setSelectedRelation(relation)}
                        className={cn(
                          "px-4 py-2 rounded-full border transition-all text-sm",
                          selectedRelation === relation
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 bg-background"
                        )}
                      >
                        {relation}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
