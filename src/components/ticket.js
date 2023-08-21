import React, { useState, useEffect } from "react";
import axios from "axios";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewState, setViewState] = useState({});
  const [groupBy, setGroupBy] = useState("status");
  const [sortOrder, setSortOrder] = useState("priority");

  const priorityLevel = new Map([
    ['0', "No Priority"],
    ['1', "Low"],
    ['2', "Medium"],
    ['3', "High"],
    ['4', "Urgent"],
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "https://api.quicksell.co/v1/internal/frontend-assignment"
        );
        const { tickets, users } = response.data;
        setTickets(tickets);
        setUsers(users);

        let initialState = JSON.parse(localStorage.getItem("kanbanViewState"));
        // console.log(initialState);
        setGroupBy(initialState.groupBy);
        setSortOrder(initialState.sortOrder);

        if (initialState.groupBy) {
          setViewState(initialState);
        } else {
          localStorage.setItem(
            "kanbanViewState",
            JSON.stringify({ groupBy, sortOrder })
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [viewState]);

  const groupedTickets = groupTickets(tickets, groupBy);
  const sortedGroupedTickets = sortTicketsInGroups(groupedTickets, sortOrder);

  const handleGroupChange = (e) => {
    const newGroupBy = e.target.value;
    let initialState = JSON.parse(localStorage.getItem("kanbanViewState"));
    localStorage.removeItem("kanbanViewState");
    localStorage.setItem(
      "kanbanViewState",
      JSON.stringify({ ...initialState, groupBy: newGroupBy })
    );
    setGroupBy(newGroupBy);
  };

  const handleSortChange = (e) => {
    const newSortOrder = e.target.value;
    let initialState = JSON.parse(localStorage.getItem("kanbanViewState"));
    localStorage.removeItem("kanbanViewState");
    localStorage.setItem(
      "kanbanViewState",
      JSON.stringify({ ...initialState, sortOrder: newSortOrder })
    );
    setSortOrder(newSortOrder);
  };

  return (
    <div className="App">
      <div className="left-container">
        <label htmlFor="group">Group By </label>
        <select id="group" value={groupBy} onChange={handleGroupChange}>
          <option value="status">Status</option>
          <option value="user">User</option>
          <option value="priority">Priority</option>
        </select>
        <br />
        <label htmlFor="sort">Sort By </label>
        <select id="sort" value={sortOrder} onChange={handleSortChange}>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div className="kanban-board">
        {Object.entries(sortedGroupedTickets).map(([group, groupTickets]) => (
          <div key={group} className="kanban-column">
            <h2>
              {groupBy === "user"
                ? users.find(({ id }) => group === id).name
                : groupBy === "priority"
                ? priorityLevel.get(group)
                : group}
            </h2>

            {groupTickets.map((ticket) => (
              <div key={ticket.id} className="kanban-card">
                <h3 className="ticket-id">{ticket.id}</h3>
                <p className="ticket-title">
                  <strong>{ticket.title}</strong>
                </p>
                <p className="ticket-tag">{ticket.tag}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const groupTickets = (tickets, groupBy) => {
  const grouped = {};

  tickets.forEach((ticket) => {
    const groupKey = groupBy === "user" ? ticket.userId : ticket[groupBy];
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(ticket);
  });
  // console.log(grouped);
  return grouped;
};

const sortTicketsInGroups = (groupedTickets, sortOrder) => {
  const sorted = {};

  for (const [groupKey, groupTickets] of Object.entries(groupedTickets)) {
    let sortedGroup = [...groupTickets];
    if (sortOrder === "priority") {
      sortedGroup.sort((a, b) => b.priority - a.priority);
    } else if (sortOrder === "title") {
      sortedGroup.sort((a, b) => a.title.localeCompare(b.title));
    }
    sorted[groupKey] = sortedGroup;
  }
  // console.log(sorted);
  return sorted;
};

export default Ticket;
