import { StyleSheet } from 'react-native';

import TitleBar from '@/components/titlebar';
import CheckboxWithLabel from '@/components/checkbox';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown, ChevronRight, ThumbsDown, ThumbsUp } from '@tamagui/lucide-icons-2';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { ListItem, ScrollView, SizableText, Spinner, View, XStack, YStack } from 'tamagui';
import { router } from 'expo-router';

type Rental = {
  id: string;
  startTime: string;
  endTime: string | null;
  bikeId: number | null;
  userId: string | null;
  userName: string | null;
  riderHappy: boolean | null;
};

type Option = { value: string; label: string };

const OVERTIME_HOURS = 12;

function isOvertime(rental: Rental) {
  const end = rental.endTime ? new Date(rental.endTime).getTime() : Date.now();
  const hours = (end - new Date(rental.startTime).getTime()) / (1000 * 60 * 60);
  return hours >= OVERTIME_HOURS;
}

function formatRentalTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// A tap-to-expand picker rather than a true popover/dropdown — this avoids
// Tamagui's Select/Popover, which portal their content the same way Dialog
// did and hit the same native crash earlier in this app.
function FilterPicker({ label, value, options, onChange }: {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <YStack>
      <XStack
        items="center"
        justify="space-between"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={10}
        px="$3"
        py="$2.5"
        onPress={() => setOpen((prev) => !prev)}
      >
        <SizableText size="$3" numberOfLines={1}>{selectedLabel ?? `All ${label}`}</SizableText>
        <ChevronDown size={16} opacity={0.6} />
      </XStack>

      {open && (
        <YStack borderWidth={1} borderColor="$borderColor" borderRadius={10} mt="$2" overflow="hidden">
          <ListItem
            title={`All ${label}`}
            active={value == null}
            icon={value == null ? <Check size={16} /> : undefined}
            onPress={() => { onChange(null); setOpen(false); }}
          />
          {options.map((option) => (
            <ListItem
              key={option.value}
              title={option.label}
              active={option.value === value}
              icon={option.value === value ? <Check size={16} /> : undefined}
              onPress={() => { onChange(option.value); setOpen(false); }}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );
}

export default function AdminRides() {
  const insets = useSafeAreaInsets();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [bikeFilter, setBikeFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [overtimeOnly, setOvertimeOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    getRentals();
  }, []);

  async function getRentals() {
    setLoading(true);
    const { data } = await supabase
      .from('rentals')
      .select('id, start_time, end_time, user_id, rider_happy, bicycles(bike_id), profiles(name)')
      .order('start_time', { ascending: false });

    setRentals((data || []).map((rental: any) => ({
      id: rental.id,
      startTime: rental.start_time,
      endTime: rental.end_time,
      bikeId: rental.bicycles?.bike_id ?? null,
      userId: rental.user_id,
      userName: rental.profiles?.name ?? null,
      riderHappy: rental.rider_happy,
    })));
    setLoading(false);
  }

  const bikeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    rentals.forEach((rental) => {
      if (rental.bikeId != null) {
        const key = rental.bikeId.toString();
        if (!seen.has(key)) seen.set(key, `WPI${rental.bikeId}`);
      }
    });
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rentals]);

  const userOptions = useMemo(() => {
    const seen = new Map<string, string>();
    rentals.forEach((rental) => {
      if (rental.userId && !seen.has(rental.userId)) {
        seen.set(rental.userId, rental.userName || 'Unnamed User');
      }
    });
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      if (bikeFilter != null && rental.bikeId?.toString() !== bikeFilter) return false;
      if (userFilter != null && rental.userId !== userFilter) return false;
      if (activeOnly && rental.endTime != null) return false;
      if (overtimeOnly && !isOvertime(rental)) return false;
      return true;
    });
  }, [rentals, bikeFilter, userFilter, activeOnly, overtimeOnly]);

  function openRideHistory(rental: Rental) {
    if (rental.bikeId == null) return;
    router.push({
      pathname: '/bike/[id]',
      params: {
        id: rental.bikeId.toString(),
        start: rental.startTime,
        ...(rental.endTime ? { end: rental.endTime } : {}),
      },
    });
  }

  const rentalList = filteredRentals.map((rental) => (
    <YStack key={rental.id}>
      <ListItem
        title={rental.bikeId != null ? `WPI${rental.bikeId}` : 'Unknown Bike'}
        subTitle={formatRentalTime(rental.startTime)}
        iconAfter={
          <XStack items="center" gap="$2">
            {rental.endTime == null && (
              <View width={15} height={15} borderRadius={999} bg="green" border={"2px solid lightgreen"} />
            )}
            {rental.riderHappy != null && (
              rental.riderHappy
                ? <ThumbsUp size={16} color="green" />
                : <ThumbsDown size={16} color="darkred" />
            )}
            <ChevronRight size={20} opacity={0.5} />
          </XStack>
        }
        onPress={() => openRideHistory(rental)}
        disabled={rental.bikeId == null}
        pressStyle={{ opacity: 0.6 }}
      />
      <View width={"100%"} bg={"$white3"} height={1} alignItems={"flex-end"}>
        <View bg={"lightgray"} width={"70%"} height={"100%"} marginEnd={"$4"}/>
      </View>
    </YStack>
  ));

  return (
    <YStack style={styles.container} mt={insets.top} mb={insets.bottom + 60} gap={"$4"}>
      <TitleBar title='Rides' returnLink={"/(public)"}></TitleBar>

      <View
        width="100%"
        borderRadius={16}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View position="relative" borderRadius={16} overflow="hidden" style={StyleSheet.absoluteFillObject}>
          <GlassView
            isInteractive
            style={[
              StyleSheet.absoluteFillObject,
              isLiquidGlassAvailable() ? null : { backgroundColor: "rgb(228, 228, 228)" },
            ]}
          />
        </View>

        <YStack gap="$3" p="$3">
          <FilterPicker label="Bikes" value={bikeFilter} options={bikeOptions} onChange={setBikeFilter} />
          <FilterPicker label="Riders" value={userFilter} options={userOptions} onChange={setUserFilter} />
          <XStack gap="$4" flexWrap="wrap">
            <CheckboxWithLabel
              size="$3"
              label="Overtime only"
              checked={overtimeOnly}
              onCheckedChange={(checked) => setOvertimeOnly(checked === true)}
            />
            <CheckboxWithLabel
              size="$3"
              label="Active only"
              checked={activeOnly}
              onCheckedChange={(checked) => setActiveOnly(checked === true)}
            />
          </XStack>
        </YStack>
      </View>

      <ScrollView flex={1} m={"$2"} borderRadius={"$8"} backgroundColor={"$white3"} height={5} width={"100%"}>
        {loading ? (
          <YStack items="center" py="$6"><Spinner/></YStack>
        ) : filteredRentals.length === 0 ? (
          <YStack items="center" py="$6"><SizableText opacity={0.6}>No rides found</SizableText></YStack>
        ) : (
          rentalList
        )}
      </ScrollView>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
});
