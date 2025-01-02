import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

export default function DatePicker({ value, onDateChange }) {
  const swiper = useRef();
  const [week, setWeek] = useState(0); // Week offset from the current week
  const [visibleWidth, setVisibleWidth] = useState(width); // Default to full screen width

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setVisibleWidth(width);
  };

  const blockWidth = visibleWidth / 7; // Exact width to fit 7 blocks

  // Adjust the visible week when the value (selectedDate) changes
  useEffect(() => {
    const todayStartOfWeek = moment(value).startOf("isoWeek");
    const currentStartOfWeek = moment().startOf("isoWeek");
    const weekOffset = todayStartOfWeek.diff(currentStartOfWeek, "weeks");
    setWeek(weekOffset);

    // Scroll to the center of the week
    swiper.current?.scrollTo(1, false);
  }, [value]);

  const weeks = React.useMemo(() => {
    const start = moment().add(week, "weeks").startOf("isoWeek");
    return [-1, 0, 1].map((adj) =>
      Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, "week").add(index, "day");
        return {
          weekday: date.format("ddd"),
          day: date.format("D"),
          month: date.format("MMM"),
          date: date.toDate(),
        };
      })
    );
  }, [week]);

  const handleIndexChange = (index) => {
    if (index === 1) return; // If center view, do nothing
    setTimeout(() => {
      const newIndex = index - 1; // -1 for left, +1 for right
      const newWeek = week + newIndex;
      setWeek(newWeek); // Adjust week offset
      swiper.current.scrollTo(1, false); // Reset to center
    }, 100);
  };

  return (
    <View style={styles.picker} onLayout={handleLayout}>
      <Swiper
        ref={swiper}
        index={1}
        loop={false}
        showsPagination={false}
        onIndexChanged={handleIndexChange}
      >
        {weeks.map((dates, index) => (
          <View style={[styles.itemRow, { width: visibleWidth }]} key={index}>
            {dates.map((item, dateIndex) => {
              const isActive =
                value.toDateString() === item.date.toDateString();
              return (
                <TouchableWithoutFeedback
                  key={dateIndex}
                  onPress={() => onDateChange(item.date)}
                >
                  <View
                    style={[
                      styles.item,
                      { width: blockWidth },
                      isActive && {
                        backgroundColor: "#111",
                        borderColor: "#111",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemWeekday,
                        isActive && { color: "#fff" },
                      ]}
                    >
                      {item.weekday}
                    </Text>
                    <Text
                      style={[styles.itemDate, isActive && { color: "#fff" }]}
                    >
                      {item.day}
                    </Text>
                    <Text
                      style={[styles.itemMonth, isActive && { color: "#fff" }]}
                    >
                      {item.month}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
        ))}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 12,
  },
  item: {
    height: 70,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#e3e3e3",
    backgroundColor: "#f9f9f9",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: "500",
    color: "#737373",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  itemMonth: {
    fontSize: 13,
    fontWeight: "400",
    color: "#737373",
  },
});
