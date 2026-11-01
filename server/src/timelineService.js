/**
 * Dependency-aware timeline generator and DAG resolver
 */

export const DEFAULT_TIMELINE_TEMPLATES = {
  wedding: [
    {
      id: 'task_budget_vision',
      title: 'Determine Total Budget & Core Priorities',
      category: 'planning',
      offsetDaysFromEvent: -240, // 8 months out
      dependsOn: [],
      description: 'Align with key stakeholders on maximum spend and non-negotiables.'
    },
    {
      id: 'task_guest_estimate',
      title: 'Draft Preliminary Guest Count',
      category: 'guests',
      offsetDaysFromEvent: -210, // 7 months out
      dependsOn: ['task_budget_vision'],
      description: 'Establish initial guest range required for venue scouting.'
    },
    {
      id: 'task_venue_scouting',
      title: 'Scout & Book Ceremony / Reception Venue',
      category: 'venue',
      offsetDaysFromEvent: -180, // 6 months out
      dependsOn: ['task_guest_estimate'],
      description: 'Confirm capacity, accessibility, and date reservation with venue.'
    },
    {
      id: 'task_photo_booking',
      title: 'Contract Photographer & Videographer',
      category: 'photography',
      offsetDaysFromEvent: -150, // 5 months out
      dependsOn: ['task_venue_scouting'],
      description: 'Lock in date with visual team before popular calendars fill up.'
    },
    {
      id: 'task_send_save_dates',
      title: 'Distribute Save the Dates',
      category: 'guests',
      offsetDaysFromEvent: -120, // 4 months out
      dependsOn: ['task_venue_scouting'],
      description: 'Notify attendees so travel and accommodations can be arranged.'
    },
    {
      id: 'task_finalize_guest_count',
      title: 'Finalize RSVP & Guest Count',
      category: 'guests',
      offsetDaysFromEvent: -45, // ~6 weeks out
      dependsOn: ['task_send_save_dates'],
      description: 'Confirm definitive numbers needed before locking catering plates.'
    },
    {
      id: 'task_catering_order',
      title: 'Confirm Catering Order & Dietary Menus',
      category: 'catering',
      offsetDaysFromEvent: -30, // 1 month out
      dependsOn: ['task_finalize_guest_count'],
      description: 'Submit guaranteed headcount and custom meal requirements.'
    },
    {
      id: 'task_seating_decor',
      title: 'Finalize Seating Chart & Floral Decor Deliverables',
      category: 'decor',
      offsetDaysFromEvent: -14, // 2 weeks out
      dependsOn: ['task_finalize_guest_count'],
      description: 'Map tables based on attendee mobility and dietary grouping.'
    },
    {
      id: 'task_rehearsal_runthrough',
      title: 'Rehearsal Run-through & Final Vendor Check-in',
      category: 'execution',
      offsetDaysFromEvent: -2,
      dependsOn: ['task_catering_order', 'task_seating_decor'],
      description: 'Coordinate schedule timing, cue music, and confirm load-in windows.'
    },
    {
      id: 'task_event_day',
      title: 'Celebration Day Execution',
      category: 'execution',
      offsetDaysFromEvent: 0,
      dependsOn: ['task_rehearsal_runthrough'],
      description: 'Celebrate and oversee coordinated timeline run of show.'
    }
  ],
  birthday: [
    {
      id: 'task_birthday_theme',
      title: 'Set Theme, Budget & Guest Roster',
      category: 'planning',
      offsetDaysFromEvent: -60,
      dependsOn: [],
      description: 'Establish tone, party style, and target age group interests.'
    },
    {
      id: 'task_bday_venue',
      title: 'Reserve Venue or Space',
      category: 'venue',
      offsetDaysFromEvent: -45,
      dependsOn: ['task_birthday_theme'],
      description: 'Lock in party hall, park shelter, or private dining room.'
    },
    {
      id: 'task_bday_invites',
      title: 'Send Invitations & Collect RSVPs',
      category: 'guests',
      offsetDaysFromEvent: -30,
      dependsOn: ['task_bday_venue'],
      description: 'Request dietary restrictions and attendee headcount.'
    },
    {
      id: 'task_bday_catering_cake',
      title: 'Order Cake & Catering/Snacks',
      category: 'catering',
      offsetDaysFromEvent: -15,
      dependsOn: ['task_bday_invites'],
      description: 'Custom cake design and kid/adult-friendly food quantities.'
    },
    {
      id: 'task_bday_entertainment',
      title: 'Confirm Entertainment / Games & Favors',
      category: 'entertainment',
      offsetDaysFromEvent: -10,
      dependsOn: ['task_birthday_theme'],
      description: 'Secure playlist, performers, prizes, and sensory-friendly zones.'
    },
    {
      id: 'task_bday_execution',
      title: 'Party Day Setup & Celebration',
      category: 'execution',
      offsetDaysFromEvent: 0,
      dependsOn: ['task_bday_catering_cake', 'task_bday_entertainment'],
      description: 'Decorate venue, welcome guests, cut cake!'
    }
  ],
  community: [
    {
      id: 'task_comm_permits',
      title: 'Secure Municipal Permits & Facility Approvals',
      category: 'permits',
      offsetDaysFromEvent: -90,
      dependsOn: [],
      description: 'File noise permits, park permits, and public safety clearances.'
    },
    {
      id: 'task_comm_volunteers',
      title: 'Recruit Volunteer Leads & Accessibility Coordinators',
      category: 'logistics',
      offsetDaysFromEvent: -60,
      dependsOn: ['task_comm_permits'],
      description: 'Designate teams for registration, staging, waste, and ADA assistance.'
    },
    {
      id: 'task_comm_sponsors_vendors',
      title: 'Confirm Community Booths & Food Vendors',
      category: 'catering',
      offsetDaysFromEvent: -40,
      dependsOn: ['task_comm_permits'],
      description: 'Verify health inspection certs and stall placements.'
    },
    {
      id: 'task_comm_av_stage',
      title: 'Rent Audio/Visual Staging & Restrooms',
      category: 'equipment',
      offsetDaysFromEvent: -25,
      dependsOn: ['task_comm_permits'],
      description: 'Setup PA system, generator power, accessible ramps, and portable facilities.'
    },
    {
      id: 'task_comm_promo_outreach',
      title: 'Community Multilingual Outreach & Signage',
      category: 'guests',
      offsetDaysFromEvent: -20,
      dependsOn: ['task_comm_sponsors_vendors'],
      description: 'Distribute multilingual flyers, wayfinding maps, and digital notices.'
    },
    {
      id: 'task_comm_execution',
      title: 'Community Event Day & Teardown',
      category: 'execution',
      offsetDaysFromEvent: 0,
      dependsOn: ['task_comm_av_stage', 'task_comm_volunteers'],
      description: 'Coordinate staging, welcome public, and oversee post-event cleanup.'
    }
  ]
};

/**
 * Builds a sequenced timeline with calculated target dates and dependency statuses.
 */
export function generateTimeline(eventType, eventDateStr) {
  const eventDate = new Date(eventDateStr);
  const now = new Date();
  const template = DEFAULT_TIMELINE_TEMPLATES[eventType] || DEFAULT_TIMELINE_TEMPLATES.wedding;

  const tasks = template.map(t => {
    const targetDate = new Date(eventDate);
    targetDate.setDate(targetDate.getDate() + t.offsetDaysFromEvent);

    return {
      id: t.id,
      title: t.title,
      category: t.category,
      description: t.description,
      offsetDaysFromEvent: t.offsetDaysFromEvent,
      targetDate: targetDate.toISOString().split('T')[0],
      dependsOn: t.dependsOn,
      status: 'pending', // 'pending' | 'in_progress' | 'completed' | 'blocked'
      completedAt: null
    };
  });

  return resolveTimelineDependencies(tasks);
}

/**
 * Evaluates the status of each task based on dependencies:
 * If an unresolved dependency exists -> task is 'blocked'.
 * If all dependencies are completed -> task is ready ('pending' or 'in_progress').
 */
export function resolveTimelineDependencies(tasks) {
  const completedIds = new Set(tasks.filter(t => t.status === 'completed').map(t => t.id));

  return tasks.map(task => {
    if (task.status === 'completed') {
      return task;
    }

    const uncompletedDeps = (task.dependsOn || []).filter(depId => !completedIds.has(depId));
    
    if (uncompletedDeps.length > 0) {
      return {
        ...task,
        status: 'blocked',
        blockedBy: uncompletedDeps
      };
    }

    return {
      ...task,
      status: task.status === 'blocked' ? 'pending' : task.status,
      blockedBy: []
    };
  });
}

/**
 * Toggles a task status (e.g. from pending/in_progress to completed), and updates downstream tasks.
 */
export function updateTaskStatus(tasks, taskId, newStatus) {
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      };
    }
    return task;
  });

  return resolveTimelineDependencies(updatedTasks);
}

/**
 * Recalculate target dates when event date shifts.
 */
export function shiftEventDate(tasks, newEventDateStr) {
  const newEventDate = new Date(newEventDateStr);
  
  const updatedTasks = tasks.map(task => {
    const newTarget = new Date(newEventDate);
    newTarget.setDate(newTarget.getDate() + task.offsetDaysFromEvent);
    return {
      ...task,
      targetDate: newTarget.toISOString().split('T')[0]
    };
  });

  return resolveTimelineDependencies(updatedTasks);
}
